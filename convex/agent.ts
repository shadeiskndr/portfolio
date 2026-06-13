import { Agent } from "@convex-dev/agent";
import { defineModel } from "@convex-dev/agent/vercel";
import { getChatModel } from "../lib/chat/provider";
import { components } from "./_generated/api";

const SYSTEM_PROMPT =
  "You are a friendly assistant embedded on Shahathir Iskandar's personal portfolio site. " +
  "Be concise, helpful, and conversational. If you don't know something, say so. " +
  "Do not use emojis. " +
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

const model = defineModel({
  model: getChatModel(),
  instructions: SYSTEM_PROMPT,
  providerOptions: {
    openai: {
      forceReasoning: true,
      reasoningEffort: "high",
      reasoningSummary: "auto",
    },
  },
});

export const chatAgent = new Agent(components.agent, {
  name: "portfolio-assistant",
  model,
});
