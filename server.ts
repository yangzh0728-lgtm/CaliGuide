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

dotenv.config();

const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "deepseek-v4-flash";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.API_KEY;
  const appId = process.env.APP_ID;
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
  });

  app.post("/api/chat", async (req, res) => {
    if (!aiClient) {
      return res.status(500).json({ error: "API_KEY and APP_ID must be configured" });
    }

    const requestId = crypto.randomUUID();
    const startedAt = performance.now();

    try {
      const { message, history } = req.body;

      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatRequest = buildChatCompletionRequest({
        model: CHAT_MODEL,
        message,
        history: Array.isArray(history) ? history : [],
      });
      console.log(
        `[chat:${requestId}] start model=${CHAT_MODEL} messageChars=${message.length} history=${chatRequest.messages.length - 2}`,
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

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (!content) {
          continue;
        }

        firstTokenAt ??= performance.now();
        chunks += 1;
        chars += content.length;
        res.write(content);
      }

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
