import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";
import type { ChatModel } from "./models";

/**
 * RAG embedding model: Amazon Nova 2 multimodal embeddings. Supported output
 * dimensions are 256 / 384 / 1024 / 3072; 1024 is the Nova default. This value
 * MUST match the `dimensions` of the `portfolioChunks` vector index in
 * `convex/schema.ts` — changing it means re-creating the index and re-ingesting.
 */
export const EMBEDDING_MODEL_ID = "amazon.nova-2-multimodal-embeddings-v1:0";
export const EMBEDDING_DIMENSION = 1024;

/**
 * Embedding model for RAG, via the STANDARD Bedrock provider (SigV4). This is
 * deliberately not the Mantle provider used for chat — Mantle exposes no
 * embedding models (`embeddingModel()` throws NoSuchModelError). It signs with
 * the AWS credentials already in the deployment env and hits
 * `bedrock-runtime.<region>.amazonaws.com`. Nova multimodal embeddings launched
 * in us-east-1, so allow an embedding-specific region override.
 */
export function getEmbeddingModel() {
  const region = process.env.AWS_EMBEDDING_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  return createAmazonBedrock({ region }).embeddingModel(EMBEDDING_MODEL_ID);
}

function rewriteSseLine(line: string): string {
  if (line.startsWith("event:")) {
    return line.includes("response.reasoning.delta")
      ? "event: response.reasoning_summary_text.delta"
      : line;
  }
  if (!line.startsWith("data:")) return line;
  const json = line.slice("data:".length).trimStart();
  if (!json || json === "[DONE]") return line;
  let event: { type?: string; item_id?: string; delta?: string };
  try {
    event = JSON.parse(json);
  } catch {
    return line;
  }
  if (event.type !== "response.reasoning.delta") return line;
  return `data: ${JSON.stringify({
    type: "response.reasoning_summary_text.delta",
    item_id: event.item_id,
    summary_index: 0,
    delta: event.delta,
  })}`;
}

const bridgeReasoningFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.body || !contentType.includes("text/event-stream")) return res;

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        controller.enqueue(encoder.encode(`${rewriteSseLine(line)}\n`));
      }
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(rewriteSseLine(buffer)));
    },
  });

  return new Response(res.body.pipeThrough(transform), {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};

/**
 * Build the AI SDK model for a concrete Bedrock Mantle id. `api` selects the
 * serving surface (`.chat()` vs `.responses()`) and is resolved from the
 * `chatModels` registry by the caller — this stays a plain, ctx-free function
 * so it works both in Convex functions and at module load.
 */
export function getChatModel(
  modelId: string,
  surface: ChatModel["surface"],
  api: ChatModel["api"]
) {
  const region = process.env.AWS_REGION ?? "us-east-1";
  // Native Bedrock Converse API (standard provider) for models not exposed on
  // the Mantle OpenAI-compat endpoint (e.g. GLM).
  if (surface === "converse") {
    return createAmazonBedrock({ region })(modelId);
  }
  const bedrockMantle = createBedrockMantle({
    region,
    baseURL:
      process.env.BEDROCK_MANTLE_BASE_URL ?? `https://bedrock-mantle.${region}.api.aws/openai/v1`,
    fetch: bridgeReasoningFetch as typeof fetch,
  });
  return api === "chat" ? bedrockMantle.chat(modelId) : bedrockMantle.responses(modelId);
}
