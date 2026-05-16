import { httpRouter } from "convex/server";
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

    const payload = JSON.parse(rawBody) as GitHubPushPayload;
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

export default http;
