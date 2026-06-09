import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
const CHAT_MODEL = process.env.CHAT_MODEL?.trim() || "deepseek-v4-flash";
const SYSTEM_PROMPT =
  "You are CaliBot, a professional immigration assistant for California. You help users with visa status, document preparation, and legal guidance. Be helpful, concise, and professional. Remind users to consult a qualified immigration attorney for legal decisions.";

type ChatHistoryMessage = {
  role: "user" | "bot" | "assistant";
  content: string;
};

function toChatMessages(message: string, history: ChatHistoryMessage[] = []) {
  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history
      .filter((item) => item.content?.trim())
      .map((item) => ({
        role: item.role === "user" ? ("user" as const) : ("assistant" as const),
        content: item.content,
      })),
    { role: "user" as const, content: message },
  ];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.API_KEY;
  const appId = process.env.APP_ID;
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

      const messages = toChatMessages(message, Array.isArray(history) ? history : []);
      console.log(
        `[chat:${requestId}] start model=${CHAT_MODEL} messageChars=${message.length} history=${messages.length - 2}`,
      );

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.flushHeaders?.();

      const stream = await aiClient.chat.completions.create({
        model: CHAT_MODEL,
        messages,
        stream: true,
      });

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
