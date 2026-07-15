import type { HttpRouter } from "convex/server";
import { httpAction } from "../_generated/server";

const RESUME_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  ...RESUME_CORS,
};

type SseHandler = ReturnType<typeof httpAction>;

export function sseRoute(http: HttpRouter, path: string, post: SseHandler) {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(() =>
      Promise.resolve(new Response(null, { status: 204, headers: RESUME_CORS }))
    ),
  });
  http.route({ path, method: "POST", handler: post });
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
        send({ type: "error", error: e instanceof Error ? e.message : errorLabel });
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
  return new Response(message, { status: 400, headers: RESUME_CORS });
}
