"use client";

import { useChat } from "@ai-sdk/react";
import { useChatTransport } from "@convex-dev/agent/vercel/react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ui/shadcn-io/ai/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/shadcn-io/ai/reasoning";
import { api } from "@/convex/_generated/api";

const streamdownPlugins = {
  code,
  math: createMathPlugin({ singleDollarTextMath: true }),
  mermaid,
  cjk,
};

export default function Chat() {
  const [hasText, setHasText] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const { messages, sendMessage, status, stop } = useChat(
    useChatTransport(
      api.chat,
      { sessionId },
      {
        id: sessionId,
        cancelOnAbort: true,
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Chat request failed");
          return "Something went wrong reaching the model. Please try again.";
        },
      }
    )
  );

  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text?.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setHasText(false);
  }

  return (
    <div className="flex h-[70vh] flex-col gap-4">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="I'll try my best to answer your questions"
              title="Ask me anything"
            />
          ) : null}

          {messages.map((message, i) => {
            const isUser = message.role === "user";
            const isLast = i === messages.length - 1;
            const isStreaming = isLast && status === "streaming";
            return (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, partIndex) => {
                    const key = `${message.id}-${partIndex}`;
                    if (part.type === "reasoning") {
                      return (
                        <Reasoning isStreaming={isStreaming} key={key}>
                          <ReasoningTrigger />
                          <ReasoningContent plugins={streamdownPlugins}>
                            {part.text}
                          </ReasoningContent>
                        </Reasoning>
                      );
                    }
                    if (part.type === "text") {
                      return isUser ? (
                        <span className="whitespace-pre-wrap" key={key}>
                          {part.text}
                        </span>
                      ) : (
                        <MessageResponse
                          animated
                          isAnimating={isStreaming}
                          key={key}
                          plugins={streamdownPlugins}
                        >
                          {part.text}
                        </MessageResponse>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setHasText(e.target.value.trim().length > 0)}
            placeholder="Type a message…"
          />
        </PromptInputBody>
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit
            disabled={!isBusy && !hasText}
            onClick={isBusy ? () => stop() : undefined}
            status={status}
            type={isBusy ? "button" : "submit"}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
