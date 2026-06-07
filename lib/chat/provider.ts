import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";

export function getChatModel() {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const bedrockMantle = createBedrockMantle({
    region,
    baseURL:
      process.env.BEDROCK_MANTLE_BASE_URL ?? `https://bedrock-mantle.${region}.api.aws/openai/v1`,
  });
  return bedrockMantle.chat(process.env.BEDROCK_MANTLE_MODEL ?? "google.gemma-4-e2b");
}
