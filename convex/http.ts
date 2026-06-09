import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { httpRouter } from "convex/server";
import { getChatModel } from "../lib/chat/provider";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

type GitHubPushCommit = {
  id: string;
  message: string;
  timestamp: string;
  url: string;
};

type GitHubPushPayload = {
  ref?: string;
  commits?: GitHubPushCommit[];
};

async function verifySignature(
  secret: string,
  rawBody: string,
  header: string | null
): Promise<boolean> {
  if (!header?.startsWith("sha256=")) return false;
  const provided = header.slice("sha256=".length);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("server not configured", { status: 500 });
    }

    const rawBody = await request.text();
    const ok = await verifySignature(secret, rawBody, request.headers.get("X-Hub-Signature-256"));
    if (!ok) {
      return new Response("invalid signature", { status: 401 });
    }

    const event = request.headers.get("X-GitHub-Event");
    if (event === "ping") {
      return new Response("pong", { status: 200 });
    }
    if (event !== "push") {
      return new Response("ignored", { status: 200 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    const payloadText = contentType.includes("application/x-www-form-urlencoded")
      ? (new URLSearchParams(rawBody).get("payload") ?? rawBody)
      : rawBody;
    const payload = JSON.parse(payloadText) as GitHubPushPayload;
    const trackedRef = `refs/heads/${process.env.GITHUB_BRANCH ?? "main"}`;
    if (payload.ref !== trackedRef) {
      return new Response("ignored branch", { status: 200 });
    }

    const commits = (payload.commits ?? []).map((c) => ({
      sha: c.id,
      message: c.message,
      authorDate: new Date(c.timestamp).getTime(),
      url: c.url,
    }));

    const result = await ctx.runMutation(internal.commits.ingestCommits, { commits });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

const SYSTEM_PROMPT =
  "You are a friendly assistant embedded on Shahathir Iskandar's personal portfolio site. " +
  "Be concise, helpful, and conversational. If you don't know something, say so. " +
  "Do not use emojis. " +
  "When presenting two or more items that share the same attributes (row-like data), use a " +
  "markdown table instead of repeating the same field labels under nested bullets. Use bullet " +
  "lists for prose or when items have different fields. " +
  "When you write mathematical expressions, use LaTeX: wrap inline math in single dollar " +
  "signs ($...$) and block/display math in double dollar signs ($$...$$). Do not use " +
  "parentheses or square brackets as math delimiters. " +
  "When you produce a Mermaid diagram, always wrap node labels in double quotes if they " +
  "contain spaces or any special characters such as parentheses, ampersands, slashes, or " +
  'commas — e.g. write A["Source Database (e.g., PostgreSQL)"] not A[Source Database (e.g., PostgreSQL)]. ' +
  "Unquoted special characters cause Mermaid parse errors.";

const CHAT_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

http.route({
  path: "/chat",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CHAT_CORS_HEADERS })),
});

http.route({
  path: "/chat",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    let messages: UIMessage[];
    try {
      ({ messages } = await request.json());
    } catch {
      return new Response("Invalid request body", {
        status: 400,
        headers: CHAT_CORS_HEADERS,
      });
    }

    const result = streamText({
      model: getChatModel(),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        openai: {
          // Gemma 4 E2B isn't in the SDK's reasoning-model id allowlist, so the
          // reasoning config is dropped unless we force it on.
          forceReasoning: true,
          // Model card recommends `high` to keep reasoning in its own channel.
          reasoningEffort: "high",
          // Ask for the reasoning summary so it streams back to the client.
          reasoningSummary: "auto",
        },
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        sendReasoning: true,
        onError: (error) => {
          console.error("[chat] stream error", error);
          return "Something went wrong reaching the model. Please try again.";
        },
      }),
      headers: CHAT_CORS_HEADERS,
    });
  }),
});

export default http;
