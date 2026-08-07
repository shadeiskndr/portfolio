import type { HttpRouter } from "convex/server";
import { SITE_URL } from "../../lib/site";
import { type ActionCtx, httpAction } from "../_generated/server";
import { enforceResumeLimits } from "../rateLimits";

const ALLOWED_ORIGINS = new Set([SITE_URL, "http://localhost:3000", "http://localhost:3200"]);

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
};

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const out = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) out.headers.set(key, value);
  return out;
}

export type SsePost = (ctx: ActionCtx, request: Request) => Promise<Response>;

export function sseRoute(http: HttpRouter, path: string, post: SsePost) {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction((_ctx, request) =>
      Promise.resolve(
        new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin")) })
      )
    ),
  });
  http.route({
    path,
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const headers = corsHeaders(origin);
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return withHeaders(new Response("forbidden origin", { status: 403 }), headers);
      }
      const limited = await enforceResumeLimits(ctx, request);
      return withHeaders(limited ?? (await post(ctx, request)), headers);
    }),
  });
}

export type SseSend = (frame: unknown) => void;

export function sseResponse(
  errorLabel: string,
  produce: (send: SseSend) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: SseSend = (frame) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`));
      try {
        await produce(send);
      } catch (e) {
        console.error(errorLabel, e);
        send({ type: "error", error: errorLabel });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

export async function readJson<T>(request: Request): Promise<T | undefined> {
  try {
    return (await request.json()) as T;
  } catch {
    return undefined;
  }
}

export function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}
