import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  buildPublicR2Url,
  createR2ObjectKey,
  getR2Config,
  isAllowedUploadMimeType,
} from "./src/lib/r2Upload";
import { buildChatCompletionRequest } from "./src/lib/chatServer";
import {
  addMem0Conversation,
  buildMem0MemoryContext,
  getRelevantMem0Memories,
} from "./src/lib/mem0Memory";

dotenv.config();

const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "deepseek-v4-flash";
const PENDING_MEMORY_TTL_MS = 10 * 60 * 1000;

const pendingMemoryByUserId = new Map<string, Array<{ content: string; createdAt: number }>>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.API_KEY;
  const appId = process.env.APP_ID;
  const mem0ApiKey = process.env.MEM0_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin =
    supabaseUrl && supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : null;
  const r2Config = (() => {
    try {
      return getR2Config(process.env);
    } catch {
      return null;
    }
  })();
  const r2Client = r2Config
    ? new S3Client({
        region: "auto",
        endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2Config.accessKeyId,
          secretAccessKey: r2Config.secretAccessKey,
        },
      })
    : null;
  const aiClient =
    apiKey && appId
      ? new OpenAI({
          apiKey,
          baseURL: QIANFAN_BASE_URL,
          defaultHeaders: {
            appid: appId,
          },
        })
      : null;

  // API routes
  app.post("/api/uploads/sign", async (req, res) => {
    if (!supabaseAdmin || !r2Config || !r2Client) {
      return res.status(500).json({ error: "Supabase and Cloudflare R2 must be configured" });
    }

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

    if (!accessToken) {
      return res.status(401).json({ error: "Sign in required" });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data.user) {
      return res.status(401).json({ error: "Sign in required" });
    }

    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const folder = typeof req.body?.folder === "string" ? req.body.folder : "uploads";
    const resourceId = typeof req.body?.resourceId === "string" ? req.body.resourceId : undefined;
    const attachedToType = normalizeAttachedToType(req.body?.attachedToType, folder);
    const sizeBytes = typeof req.body?.sizeBytes === "number" ? req.body.sizeBytes : null;

    if (!isAllowedUploadMimeType(mimeType)) {
      return res.status(400).json({ error: "Choose a PNG, JPG, GIF, or WebP image" });
    }

    const objectKey = createR2ObjectKey({
      userId: data.user.id,
      folder,
      resourceId,
      mimeType,
    });
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    res.json({
      uploadUrl,
      objectKey,
      publicUrl: buildPublicR2Url(r2Config.publicBaseUrl, objectKey),
    });

    void supabaseAdmin
      .from("media_assets")
      .insert({
        owner_user_id: data.user.id,
        bucket: r2Config.bucketName,
        object_key: objectKey,
        public_url: buildPublicR2Url(r2Config.publicBaseUrl, objectKey),
        mime_type: mimeType,
        size_bytes: sizeBytes,
        attached_to_type: attachedToType,
        attached_to_id: getUuidOrNull(resourceId ?? (attachedToType === "profile" ? data.user.id : "")),
      })
      .then(({ error }) => {
        if (error) {
          console.warn(`[upload:${data.user.id}] media metadata skipped`, error.message);
        }
      });
  });

  app.post("/api/chat", async (req, res) => {
    if (!aiClient) {
      return res.status(500).json({ error: "API_KEY and APP_ID must be configured" });
    }

    const requestId = crypto.randomUUID();
    const startedAt = performance.now();

    try {
      const { message, history, userId } = req.body;

      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const memoryUserId =
        typeof userId === "string" && userId.trim() ? userId.trim() : "guest";
      const pendingMemoryContext = buildPendingMemoryContext(memoryUserId);
      const memories = await getRelevantMem0Memories({
        apiKey: mem0ApiKey,
        userId: memoryUserId,
        query: message,
      })
        .catch((error) => {
          console.warn(`[chat:${requestId}] mem0 read skipped`, error);
          return [];
        });
      const memoryContext = [buildMem0MemoryContext(memories), pendingMemoryContext]
        .filter(Boolean)
        .join("\n\n");
      const chatRequest = buildChatCompletionRequest({
        model: CHAT_MODEL,
        message,
        history: Array.isArray(history) ? history : [],
        memoryContext,
      });
      console.log(
        `[chat:${requestId}] start model=${CHAT_MODEL} user=${memoryUserId} messageChars=${message.length} history=${chatRequest.messages.length - 2} memories=${memories.length} pending=${pendingMemoryContext ? 1 : 0}`,
      );

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders?.();

      const stream = await aiClient.chat.completions.create(chatRequest);

      let firstTokenAt: number | null = null;
      let chunks = 0;
      let chars = 0;
      let streamedReply = "";

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (!content) {
          continue;
        }

        firstTokenAt ??= performance.now();
        chunks += 1;
        chars += content.length;
        streamedReply += content;
        res.write(content);
      }

      await addMem0Conversation({
        apiKey: mem0ApiKey,
        userId: memoryUserId,
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: streamedReply },
        ],
      }).catch((error) => {
        console.warn(`[chat:${requestId}] mem0 add skipped`, error);
      });
      rememberPendingUserMemory(memoryUserId, message);

      res.end();
      const completedAt = performance.now();
      console.log(
        `[chat:${requestId}] done firstTokenMs=${firstTokenAt ? Math.round(firstTokenAt - startedAt) : "none"} totalMs=${Math.round(completedAt - startedAt)} chunks=${chunks} chars=${chars}`,
      );
    } catch (error: any) {
      const failedAt = performance.now();
      console.error(`[chat:${requestId}] error totalMs=${Math.round(failedAt - startedAt)}`, error);

      if (res.headersSent) {
        res.end();
        return;
      }

      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

function rememberPendingUserMemory(userId: string, message: string) {
  const cleanMessage = message.trim();
  if (!cleanMessage || !looksLikeUserMemory(cleanMessage)) {
    return;
  }

  const now = Date.now();
  const existing = pendingMemoryByUserId.get(userId) ?? [];
  pendingMemoryByUserId.set(userId, [
    ...existing.filter((item) => now - item.createdAt < PENDING_MEMORY_TTL_MS),
    { content: cleanMessage, createdAt: now },
  ].slice(-5));
}

function buildPendingMemoryContext(userId: string) {
  const now = Date.now();
  const memories = (pendingMemoryByUserId.get(userId) ?? []).filter(
    (item) => now - item.createdAt < PENDING_MEMORY_TTL_MS,
  );

  if (!memories.length) {
    return "";
  }

  pendingMemoryByUserId.set(userId, memories);
  return `Recently stated user context waiting for mem0 indexing:\n${memories
    .map((item) => `- ${item.content}`)
    .join("\n")}`;
}

function looksLikeUserMemory(message: string) {
  return (
    /\b(i am|i'm|i speak|my nationality|my visa|i live|i moved)\b/i.test(message) ||
    /(我.*是|我是|我会|我會|我住|我来自|我來自)/.test(message)
  );
}

function normalizeAttachedToType(value: unknown, folder: string) {
  const allowedTypes = new Set(["profile", "forum_post", "forum_comment", "chat", "guide", "platform"]);
  if (typeof value === "string" && allowedTypes.has(value)) {
    return value;
  }

  if (folder === "profile") {
    return "profile";
  }
  if (folder === "forum") {
    return "forum_post";
  }
  if (folder === "chat") {
    return "chat";
  }

  return "profile";
}

function getUuidOrNull(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}
