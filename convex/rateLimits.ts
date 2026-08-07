import { HOUR, MINUTE, RateLimiter, type RunMutationCtx } from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  resumeAssistGlobal: { kind: "token bucket", rate: 180, period: HOUR, capacity: 40 },
  resumeAssistPerClient: { kind: "token bucket", rate: 40, period: HOUR, capacity: 12 },
  chatGlobal: { kind: "token bucket", rate: 240, period: HOUR, capacity: 50 },
  chatPerClient: { kind: "token bucket", rate: 40, period: HOUR, capacity: 12 },
});

const IP_HEADERS = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

function clientKey(request: Request): string {
  for (const header of IP_HEADERS) {
    const first = request.headers.get(header)?.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

function retrySeconds(retryAfter: number | undefined): number {
  return Math.max(1, Math.ceil((retryAfter ?? MINUTE) / 1000));
}

function tooManyRequests(retryAfter: number | undefined): Response {
  const seconds = retrySeconds(retryAfter);
  return new Response(`rate limit exceeded — retry in ${seconds}s`, {
    status: 429,
    headers: { "Retry-After": String(seconds) },
  });
}

export async function enforceResumeLimits(
  ctx: RunMutationCtx,
  request: Request
): Promise<Response | null> {
  const perClient = await rateLimiter.limit(ctx, "resumeAssistPerClient", {
    key: clientKey(request),
  });
  if (!perClient.ok) return tooManyRequests(perClient.retryAfter);
  const overall = await rateLimiter.limit(ctx, "resumeAssistGlobal");
  if (!overall.ok) return tooManyRequests(overall.retryAfter);
  return null;
}

export async function enforceChatLimits(ctx: RunMutationCtx, clientId: string): Promise<void> {
  const perClient = await rateLimiter.limit(ctx, "chatPerClient", { key: clientId });
  if (!perClient.ok) {
    throw new ConvexError(
      `Too many messages — try again in ${retrySeconds(perClient.retryAfter)}s.`
    );
  }
  const overall = await rateLimiter.limit(ctx, "chatGlobal");
  if (!overall.ok) {
    throw new ConvexError(
      `Chat is busy right now — try again in ${retrySeconds(overall.retryAfter)}s.`
    );
  }
}
