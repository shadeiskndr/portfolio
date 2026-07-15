export interface ChatModel {
  id: string;
  name: string;
  provider: string;
  contextTokens: number;
  pricing: { inputPer1M: number; outputPer1M: number };
  surface: "mantle" | "converse";
  api: "responses" | "chat";
  supportsReasoning: boolean;
}

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

export const DEFAULT_MODEL: ChatModel = CHAT_MODELS[0];
export const DEFAULT_MODEL_ID = DEFAULT_MODEL.id;

export const DEFAULT_REASONING = true;
