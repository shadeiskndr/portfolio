"use client";

import { useChat } from "@ai-sdk/react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { isTextUIPart } from "ai";
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

const streamdownPlugins = { code, math, mermaid, cjk };

export default function Chat() {
  const [hasText, setHasText] = useState(false);
  const { messages, sendMessage, status, stop } = useChat({
    onError: (err) => toast.error(err.message || "Chat request failed"),
  });

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
            const text = message.parts
              .filter(isTextUIPart)
              .map((p) => p.text)
              .join("");
            const isUser = message.role === "user";
            const isLast = i === messages.length - 1;
            return (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{text}</span>
                  ) : (
                    <MessageResponse
                      animated
                      isAnimating={isLast && status === "streaming"}
                      plugins={streamdownPlugins}
                    >
                      {text}
                    </MessageResponse>
                  )}
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
