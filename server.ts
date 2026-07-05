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
import {
  buildForumCommentInsert,
  buildForumPostInsert,
  buildForumVoteUpsert,
} from "./src/lib/forumSupabase";

dotenv.config();

const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "deepseek-v4-flash";
const PENDING_MEMORY_TTL_MS = 10 * 60 * 1000;

const pendingMemoryByUserId = new Map<string, Array<{ content: string; createdAt: number }>>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "12mb" }));

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

  app.post("/api/uploads/avatar", async (req, res) => {
    if (!supabaseAdmin || !r2Config || !r2Client) {
      return res.status(500).json({ error: "Supabase and Cloudflare R2 must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
    const sizeBytes = typeof req.body?.sizeBytes === "number" ? req.body.sizeBytes : null;

    if (!isAllowedUploadMimeType(mimeType)) {
      return res.status(400).json({ error: "Choose a PNG, JPG, GIF, or WebP image" });
    }
    if (!base64) {
      return res.status(400).json({ error: "Profile picture is required" });
    }

    const body = Buffer.from(base64, "base64");
    const objectKey = createR2ObjectKey({
      userId: authResult.user.id,
      folder: "profile",
      mimeType,
    });
    const publicUrl = buildPublicR2Url(r2Config.publicBaseUrl, objectKey);

    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: objectKey,
          Body: body,
          ContentType: mimeType,
        }),
      );
    } catch (error) {
      console.warn(`[upload:${authResult.user.id}] avatar upload failed`, error);
      return res.status(502).json({ error: "Unable to upload profile picture" });
    }

    void supabaseAdmin
      .from("media_assets")
      .insert({
        owner_user_id: authResult.user.id,
        bucket: r2Config.bucketName,
        object_key: objectKey,
        public_url: publicUrl,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        attached_to_type: "profile",
        attached_to_id: authResult.user.id,
      })
      .then(({ error }) => {
        if (error) {
          console.warn(`[upload:${authResult.user.id}] avatar metadata skipped`, error.message);
        }
      });

    res.json({
      objectKey,
      publicUrl,
    });
  });

  app.post("/api/uploads/image", async (req, res) => {
    if (!supabaseAdmin || !r2Config || !r2Client) {
      return res.status(500).json({ error: "Supabase and Cloudflare R2 must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
    const folder = typeof req.body?.folder === "string" ? req.body.folder : "";
    const resourceId = typeof req.body?.resourceId === "string" ? req.body.resourceId : undefined;
    const attachedToType = normalizeAttachedToType(req.body?.attachedToType, folder);
    const attachedToId =
      typeof req.body?.attachedToId === "string" ? getUuidOrNull(req.body.attachedToId) : null;
    const sizeBytes = typeof req.body?.sizeBytes === "number" ? req.body.sizeBytes : null;

    if (folder !== "chat" && folder !== "forum") {
      return res.status(400).json({ error: "Upload folder is invalid" });
    }
    if (!isAllowedUploadMimeType(mimeType)) {
      return res.status(400).json({ error: "Choose a PNG, JPG, GIF, or WebP image" });
    }
    if (!base64) {
      return res.status(400).json({ error: "Image is required" });
    }

    let objectKey = "";
    try {
      objectKey = createR2ObjectKey({
        userId: authResult.user.id,
        folder,
        resourceId,
        mimeType,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || "Upload path is invalid" });
    }

    const body = Buffer.from(base64, "base64");
    const publicUrl = buildPublicR2Url(r2Config.publicBaseUrl, objectKey);

    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucketName,
          Key: objectKey,
          Body: body,
          ContentType: mimeType,
        }),
      );
    } catch (error) {
      console.warn(`[upload:${authResult.user.id}] image upload failed`, error);
      return res.status(502).json({ error: "Unable to upload image" });
    }

    void supabaseAdmin
      .from("media_assets")
      .insert({
        owner_user_id: authResult.user.id,
        bucket: r2Config.bucketName,
        object_key: objectKey,
        public_url: publicUrl,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        attached_to_type: attachedToType,
        attached_to_id: attachedToId,
      })
      .then(({ error }) => {
        if (error) {
          console.warn(`[upload:${authResult.user.id}] image metadata skipped`, error.message);
        }
      });

    res.json({
      objectKey,
      publicUrl,
    });
  });

  app.post("/api/forum/posts", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase service role must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const title = getRequiredString(req.body?.title, "Title is required");
    const body = getRequiredString(req.body?.body, "Post body is required");
    const category = getRequiredString(req.body?.category, "Category is required");
    const author = getRequiredString(req.body?.author, "Author is required");
    const avatar = getRequiredString(req.body?.avatar, "Avatar is required");
    const clientPostId = getOptionalUuid(req.body?.id);
    const imageUrls = getOptionalStringArray(req.body?.imageUrls);

    if (title instanceof Error) return res.status(400).json({ error: title.message });
    if (body instanceof Error) return res.status(400).json({ error: body.message });
    if (category instanceof Error) return res.status(400).json({ error: category.message });
    if (author instanceof Error) return res.status(400).json({ error: author.message });
    if (avatar instanceof Error) return res.status(400).json({ error: avatar.message });
    if (clientPostId instanceof Error) return res.status(400).json({ error: clientPostId.message });
    if (imageUrls instanceof Error) return res.status(400).json({ error: imageUrls.message });

    const { data, error } = await supabaseAdmin
      .from("forum_posts")
      .insert(buildForumPostInsert({
        id: clientPostId,
        userId: authResult.user.id,
        author,
        avatar,
        category,
        title,
        body,
        imageUrls,
      }))
      .select("*")
      .single();

    if (error) {
      console.warn(`[forum:${authResult.user.id}] post insert failed`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ post: data });
  });

  app.post("/api/forum/comments", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase service role must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const postId = getRequiredString(req.body?.postId, "Post is required");
    const body = getRequiredString(req.body?.body, "Comment body is required");
    const author = getRequiredString(req.body?.author, "Author is required");
    const avatar = getRequiredString(req.body?.avatar, "Avatar is required");

    if (postId instanceof Error) return res.status(400).json({ error: postId.message });
    if (body instanceof Error) return res.status(400).json({ error: body.message });
    if (author instanceof Error) return res.status(400).json({ error: author.message });
    if (avatar instanceof Error) return res.status(400).json({ error: avatar.message });

    const { error } = await supabaseAdmin.from("forum_comments").insert(
      buildForumCommentInsert({
        postId,
        userId: authResult.user.id,
        author,
        avatar,
        body,
      }),
    );

    if (error) {
      console.warn(`[forum:${authResult.user.id}] comment insert failed`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  });

  app.post("/api/forum/posts/delete", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase service role must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const postId = getRequiredString(req.body?.postId, "Post is required");
    if (postId instanceof Error) return res.status(400).json({ error: postId.message });
    if (!getUuidOrNull(postId)) {
      return res.json({ ok: true });
    }

    const { data: ownedPost, error: ownedPostError } = await supabaseAdmin
      .from("forum_posts")
      .select("id")
      .eq("id", postId)
      .eq("user_id", authResult.user.id)
      .maybeSingle();

    if (ownedPostError) {
      console.warn(`[forum:${authResult.user.id}] post owner check failed`, ownedPostError.message);
      return res.status(500).json({ error: ownedPostError.message });
    }
    if (!ownedPost) {
      return res.json({ ok: true });
    }

    const { data: comments, error: commentsReadError } = await supabaseAdmin
      .from("forum_comments")
      .select("id")
      .eq("post_id", postId);

    if (commentsReadError) {
      console.warn(`[forum:${authResult.user.id}] post comment lookup failed`, commentsReadError.message);
      return res.status(500).json({ error: commentsReadError.message });
    }

    const commentIds = (comments ?? []).map((comment) => comment.id).filter(Boolean);

    if (commentIds.length) {
      const { error: commentVoteDeleteError } = await supabaseAdmin
        .from("forum_votes")
        .delete()
        .eq("target_type", "comment")
        .in("target_id", commentIds);

      if (commentVoteDeleteError) {
        console.warn(`[forum:${authResult.user.id}] comment vote delete failed`, commentVoteDeleteError.message);
        return res.status(500).json({ error: commentVoteDeleteError.message });
      }
    }

    const { error: postVoteDeleteError } = await supabaseAdmin
      .from("forum_votes")
      .delete()
      .eq("target_type", "post")
      .eq("target_id", postId);

    if (postVoteDeleteError) {
      console.warn(`[forum:${authResult.user.id}] post vote delete failed`, postVoteDeleteError.message);
      return res.status(500).json({ error: postVoteDeleteError.message });
    }

    const { error: commentDeleteError } = await supabaseAdmin
      .from("forum_comments")
      .delete()
      .eq("post_id", postId);

    if (commentDeleteError) {
      console.warn(`[forum:${authResult.user.id}] post comments delete failed`, commentDeleteError.message);
      return res.status(500).json({ error: commentDeleteError.message });
    }

    const { error } = await supabaseAdmin
      .from("forum_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", authResult.user.id);

    if (error) {
      console.warn(`[forum:${authResult.user.id}] post delete failed`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  });

  app.post("/api/forum/comments/delete", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase service role must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const commentId = getRequiredString(req.body?.commentId, "Comment is required");
    if (commentId instanceof Error) return res.status(400).json({ error: commentId.message });
    if (!getUuidOrNull(commentId)) {
      return res.json({ ok: true });
    }

    const { data: ownedComment, error: ownedCommentError } = await supabaseAdmin
      .from("forum_comments")
      .select("id")
      .eq("id", commentId)
      .eq("user_id", authResult.user.id)
      .maybeSingle();

    if (ownedCommentError) {
      console.warn(`[forum:${authResult.user.id}] comment owner check failed`, ownedCommentError.message);
      return res.status(500).json({ error: ownedCommentError.message });
    }
    if (!ownedComment) {
      return res.json({ ok: true });
    }

    const { error: voteDeleteError } = await supabaseAdmin
      .from("forum_votes")
      .delete()
      .eq("target_type", "comment")
      .eq("target_id", commentId);

    if (voteDeleteError) {
      console.warn(`[forum:${authResult.user.id}] comment vote delete failed`, voteDeleteError.message);
      return res.status(500).json({ error: voteDeleteError.message });
    }

    const { error } = await supabaseAdmin
      .from("forum_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", authResult.user.id);

    if (error) {
      console.warn(`[forum:${authResult.user.id}] comment delete failed`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  });

  app.post("/api/forum/votes", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase service role must be configured" });
    }

    const authResult = await getRequestUser(req.headers.authorization, supabaseAdmin);
    if ("error" in authResult) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const targetType = req.body?.target_type;
    const targetId = getRequiredString(req.body?.target_id, "Vote target is required");
    const voteType = req.body?.vote_type;

    if (targetType !== "post" && targetType !== "comment") {
      return res.status(400).json({ error: "Vote target type is invalid" });
    }
    if (targetId instanceof Error) return res.status(400).json({ error: targetId.message });
    if (voteType !== null && voteType !== "useful" && voteType !== "unuseful") {
      return res.status(400).json({ error: "Vote type is invalid" });
    }

    const deleteResult = await supabaseAdmin
      .from("forum_votes")
      .delete()
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .eq("user_id", authResult.user.id);

    if (deleteResult.error) {
      console.warn(`[forum:${authResult.user.id}] vote delete failed`, deleteResult.error.message);
      return res.status(500).json({ error: deleteResult.error.message });
    }

    if (!voteType) {
      return res.json({ ok: true });
    }

    const { error } = await supabaseAdmin
      .from("forum_votes")
      .insert(buildForumVoteUpsert(targetType, targetId, authResult.user.id, voteType));

    if (error) {
      console.warn(`[forum:${authResult.user.id}] vote insert failed`, error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  });

  app.post("/api/chat", async (req, res) => {
    if (!aiClient) {
      return res.status(500).json({ error: "API_KEY and APP_ID must be configured" });
    }

    const requestId = crypto.randomUUID();
    const startedAt = performance.now();

    try {
      const { message, history, userId } = req.body;
      const imageUrls = getOptionalStringArray(req.body?.imageUrls);

      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (imageUrls instanceof Error) {
        return res.status(400).json({ error: imageUrls.message });
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
        imageUrls,
      });
      console.log(
        `[chat:${requestId}] start model=${CHAT_MODEL} user=${memoryUserId} messageChars=${message.length} images=${imageUrls.length} history=${chatRequest.messages.length - 2} memories=${memories.length} pending=${pendingMemoryContext ? 1 : 0}`,
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

type SupabaseAdminClient = {
  auth: {
    getUser: (token: string) => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
};

async function getRequestUser(authorization: string | undefined, supabaseAdmin: SupabaseAdminClient) {
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  if (!accessToken) {
    return { status: 401, error: "Sign in required" } as const;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !data.user) {
    return { status: 401, error: "Sign in required" } as const;
  }

  return { user: data.user } as const;
}

function getRequiredString(value: unknown, errorMessage: string) {
  if (typeof value !== "string" || !value.trim()) {
    return new Error(errorMessage);
  }

  return value.trim();
}

function getOptionalUuid(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !getUuidOrNull(value)) {
    return new Error("Post id must be a UUID");
  }

  return value;
}

function getOptionalStringArray(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return new Error("Expected a list of image URLs");
  }

  const cleanValues = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (cleanValues.length !== value.length) {
    return new Error("Image URLs must be strings");
  }

  return cleanValues;
}
