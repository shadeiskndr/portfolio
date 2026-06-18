/**
 * Registry of the Bedrock Mantle chat models a visitor can pick from in the
 * composer. Shared by the client (selector UI + the token-usage/pricing gauge)
 * and the server (per-run model resolution + input validation on the public,
 * unauthenticated chat endpoint).
 */
export interface ChatModel {
  /** Bedrock Mantle model id. */
  id: string;
  /** Display name shown in the selector. */
  name: string;
  /** Model creator, shown as a subtitle in the dropdown. */
  provider: string;
  /** Context window in tokens — the denominator of the usage gauge. */
  contextTokens: number;
  /**
   * List price (USD per 1M tokens), per the Bedrock model card. Illustrative;
   * feeds the Context cost estimate for the selected model.
   */
  pricing: { inputPer1M: number; outputPer1M: number };
  /**
   * Which Bedrock Mantle OpenAI-compat surface this model is served on. Drives both the endpoint
   * (`.responses()` vs `.chat()`) and whether reasoning provider options apply.
   */
  api: "responses" | "chat";
}

// 256K = 262,144; 128K = 131,072.
export const CHAT_MODELS = [
  {
    id: "google.gemma-4-e2b",
    name: "Gemma 4 E2B",
    provider: "Google",
    contextTokens: 131_072,
    pricing: { inputPer1M: 0.04, outputPer1M: 0.08 },
    api: "responses",
  },
  {
    id: "google.gemma-4-26b-a4b",
    name: "Gemma 4 26B-A4B",
    provider: "Google",
    contextTokens: 262_144,
    pricing: { inputPer1M: 0.13, outputPer1M: 0.4 },
    api: "responses",
  },
  {
    id: "google.gemma-4-31b",
    name: "Gemma 4 31B",
    provider: "Google",
    contextTokens: 262_144,
    pricing: { inputPer1M: 0.14, outputPer1M: 0.4 },
    api: "responses",
  },
] as const satisfies readonly ChatModel[];

/** Default model: the proven, cheapest option (matches the prior hardcoded model). */
export const DEFAULT_MODEL: ChatModel = CHAT_MODELS[0];
export const DEFAULT_MODEL_ID = DEFAULT_MODEL.id;

/** Resolve an (untrusted) model id to a known model, falling back to the default. */
export function getChatModelInfo(id: string | undefined | null): ChatModel {
  return CHAT_MODELS.find((m) => m.id === id) ?? DEFAULT_MODEL;
}

/** Whitelist an (untrusted) model id, coercing anything unknown to the default. */
export function resolveModelId(id: string | undefined | null): string {
  return getChatModelInfo(id).id;
}
