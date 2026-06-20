/**
 * Shape of a Bedrock Mantle chat model. The live registry lives in the
 * `chatModels` Convex table (owner-editable at runtime); `CHAT_MODELS` below is
 * only the seed used to populate that table (`models:seed`) and the bootstrap
 * fallback for empty-table / module-load paths. Resolution against the live
 * registry happens in `convex/models.ts`.
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
   * Provider surface — which SDK/endpoint serves the model. "mantle" is the
   * Bedrock Mantle OpenAI-compat gateway (Gemma); "converse" is the native
   * Bedrock Converse API via the standard provider (GLM and other non-Mantle
   * models).
   */
  surface: "mantle" | "converse";
  /**
   * Mantle OpenAI-compat route (`.responses()` vs `.chat()`). Only applies when
   * `surface` is "mantle"; ignored for "converse". Reasoning provider options
   * ride on the "responses" route.
   */
  api: "responses" | "chat";
  /**
   * Whether the model supports reasoning. It's binary — off, or on (high); the
   * Gemma 4 models don't expose graded effort. Owner-editable per model; the
   * composer only shows the reasoning toggle when this is true.
   */
  supportsReasoning: boolean;
}

// Seed data for the `chatModels` table. 256K = 262,144; 128K = 131,072.
export const CHAT_MODELS = [
  {
    id: "google.gemma-4-e2b",
    name: "Gemma 4 E2B",
    provider: "Google",
    contextTokens: 131_072,
    pricing: { inputPer1M: 0.04, outputPer1M: 0.08 },
    surface: "mantle",
    api: "responses",
    supportsReasoning: true,
  },
  {
    id: "google.gemma-4-26b-a4b",
    name: "Gemma 4 26B-A4B",
    provider: "Google",
    contextTokens: 262_144,
    pricing: { inputPer1M: 0.13, outputPer1M: 0.4 },
    surface: "mantle",
    api: "responses",
    supportsReasoning: true,
  },
  {
    id: "google.gemma-4-31b",
    name: "Gemma 4 31B",
    provider: "Google",
    contextTokens: 262_144,
    pricing: { inputPer1M: 0.14, outputPer1M: 0.4 },
    surface: "mantle",
    api: "responses",
    supportsReasoning: true,
  },
  {
    id: "zai.glm-4.7-flash",
    name: "GLM 4.7 Flash",
    provider: "Z.AI",
    contextTokens: 203_000,
    pricing: { inputPer1M: 0.07, outputPer1M: 0.4 },
    // Not on Mantle — served via the native Bedrock Converse API. `api` is
    // unused for the converse surface; kept at a valid value. Converse-served
    // reasoning isn't wired up.
    surface: "converse",
    api: "chat",
    supportsReasoning: false,
  },
  {
    id: "openai.gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    contextTokens: 131_072,
    pricing: { inputPer1M: 0.15, outputPer1M: 0.6 },
    surface: "mantle",
    api: "responses",
    supportsReasoning: true,
  },
  {
    id: "openai.gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "OpenAI",
    contextTokens: 131_072,
    pricing: { inputPer1M: 0.07, outputPer1M: 0.3 },
    surface: "mantle",
    api: "responses",
    supportsReasoning: true,
  },
] as const satisfies readonly ChatModel[];

/**
 * Bootstrap default: the cheapest option, used to seed the table's default and
 * as the fallback when the `chatModels` table is empty (before `models:seed`)
 * or a requested id isn't found. Live resolution is in `convex/models.ts`.
 */
export const DEFAULT_MODEL: ChatModel = CHAT_MODELS[0];
export const DEFAULT_MODEL_ID = DEFAULT_MODEL.id;

/**
 * Reasoning is binary for the Gemma 4 models: off, or on (which maps to the
 * responses-API `reasoningEffort: "high"`). Whether a model supports it at all
 * is the per-model `supportsReasoning` flag above; this is just the default
 * on/off state for a new visitor (on, matching the prior always-reasoning
 * behavior). The server gates the request against the model's capability.
 */
export const DEFAULT_REASONING = true;
