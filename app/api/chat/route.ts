import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getChatModel } from "@/lib/chat/provider";

export const maxDuration = 60;

const SYSTEM_PROMPT =
  "You are a friendly assistant embedded on Shahathir Iskandar's personal portfolio site. " +
  "Be concise, helpful, and conversational. If you don't know something, say so.";

export async function POST(req: Request) {
  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const result = streamText({
    model: getChatModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[chat] stream error", error);
      return "Something went wrong reaching the model. Please try again.";
    },
  });
}
