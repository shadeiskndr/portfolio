import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";

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

export function getChatModel() {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const bedrockMantle = createBedrockMantle({
    region,
    baseURL:
      process.env.BEDROCK_MANTLE_BASE_URL ?? `https://bedrock-mantle.${region}.api.aws/openai/v1`,
    fetch: bridgeReasoningFetch as typeof fetch,
  });
  return bedrockMantle.responses(process.env.BEDROCK_MANTLE_MODEL ?? "google.gemma-4-e2b");
}
