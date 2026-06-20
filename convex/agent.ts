import { Agent } from "@convex-dev/agent";
import { defineModel } from "@convex-dev/agent/vercel";
import { type ChatModel, DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/chat/models";
import { getChatModel } from "../lib/chat/provider";
import { components } from "./_generated/api";
import { calculate } from "./tools";

const SYSTEM_PROMPT =
  "You are a friendly assistant embedded on Shahathir Iskandar's personal portfolio site. " +
  "Be concise, helpful, and conversational. If you don't know something, say so. " +
  "Do not use emojis. " +
  "You have a `calculate` tool for exact arithmetic and statistics. Whenever a request " +
  "involves a computed number — sums, averages, standard deviation, powers, dot products, " +
  "and so on — call `calculate` rather than working it out yourself, then state the result " +
  "in plain language. " +
  "When presenting two or more items that share the same attributes (row-like data), use a " +
  "markdown table instead of repeating the same field labels under nested bullets. Use bullet " +
  "lists for prose or when items have different fields. " +
  "When you write mathematical expressions, use LaTeX: wrap inline math in single dollar " +
  "signs ($...$) and block/display math in double dollar signs ($$...$$). Do not use " +
  "parentheses or square brackets as math delimiters. " +
  "When you produce a Mermaid diagram, always wrap node labels in double quotes if they " +
  "contain spaces or any special characters such as parentheses, ampersands, slashes, or " +
  'commas — e.g. write A["Source Database (e.g., PostgreSQL)"] not A[Source Database (e.g., PostgreSQL)]. ' +
  "Unquoted special characters cause Mermaid parse errors.";

export function defineChatModel(
  modelId: string,
  surface: ChatModel["surface"],
  api: ChatModel["api"],
  reasoning: boolean = DEFAULT_REASONING
) {
  // Reasoning provider options ride on the Mantle responses route only.
  const usesResponsesApi = surface === "mantle" && api === "responses";
  const reasoningOn = usesResponsesApi && reasoning;
  return defineModel({
    model: getChatModel(modelId, surface, api),
    instructions: SYSTEM_PROMPT,
    // Reasoning is a responses-API feature and binary for these models. When on,
    // force it at high effort (the only supported mode); when off, disable it so
    // the model answers plainly. The caller gates `reasoning` on model support.
    ...(usesResponsesApi
      ? {
          providerOptions: {
            openai: reasoningOn
              ? {
                  forceReasoning: true,
                  reasoningEffort: "high",
                  reasoningSummary: "auto",
                }
              : { forceReasoning: false },
          },
        }
      : {}),
  });
}

export const chatAgent = new Agent(components.agent, {
  name: "portfolio-assistant",
  // Bootstrap model for Agent construction only; every real run passes an
  // explicit model resolved from the chatModels table (see chat.execute).
  model: defineChatModel(DEFAULT_MODEL.id, DEFAULT_MODEL.surface, DEFAULT_MODEL.api),
  tools: { calculate },
});
