"use client";

import { useChat } from "@ai-sdk/react";
import { useChatTransport } from "@convex-dev/agent/vercel/react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { useMutation, useQuery } from "convex/react";
import { MessageSquarePlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v7 as uuidv7 } from "uuid";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePersistentId } from "@/hooks/use-persistent-id";
import { cn } from "@/lib/utils";

const streamdownPlugins = {
  code,
  math: createMathPlugin({ singleDollarTextMath: true }),
  mermaid,
  cjk,
};

const CLIENT_ID_KEY = "portfolio-chat-client-id";
const SESSION_ID_KEY = "portfolio-chat-session-id";

export default function Chat() {
  // Stable per-browser id scoping the visitor's sessions; and the currently
  // open session, persisted so a reload resumes the last conversation.
  const clientId = usePersistentId(CLIENT_ID_KEY);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string>(SESSION_ID_KEY, () =>
    uuidv7()
  );
  const sessions = useQuery(api.sessions.list, clientId ? { clientId } : "skip");
  const removeSession = useMutation(api.sessions.remove);

  function handleNewChat() {
    setActiveSessionId(uuidv7());
  }

  function handleSelectSession(sessionId: string) {
    if (sessionId !== activeSessionId) setActiveSessionId(sessionId);
  }

  function handleDeleteSession(sessionId: string) {
    if (!clientId) return;
    void removeSession({ sessionId, clientId });
    if (sessionId === activeSessionId) setActiveSessionId(uuidv7());
  }

  return (
    <div className="flex h-[70vh] flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Chats
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Recent chats</DropdownMenuLabel>
              {sessions === undefined ? (
                <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
              ) : sessions.length === 0 ? (
                <DropdownMenuItem disabled>No saved chats yet</DropdownMenuItem>
              ) : (
                sessions.map((session) => (
                  <DropdownMenuItem
                    className={cn(
                      "justify-between gap-2",
                      session.sessionId === activeSessionId && "font-medium"
                    )}
                    key={session.sessionId}
                    onClick={() => handleSelectSession(session.sessionId)}
                  >
                    <span className="truncate">{session.title ?? "New chat"}</span>
                    <button
                      aria-label="Delete chat"
                      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSession(session.sessionId);
                      }}
                      type="button"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={handleNewChat} size="sm" variant="outline">
          <MessageSquarePlusIcon className="size-4" />
          New chat
        </Button>
      </div>

      <ChatSession
        clientId={clientId}
        key={activeSessionId}
        onSent={() => setActiveSessionId(activeSessionId)}
        sessionId={activeSessionId}
      />
    </div>
  );
}

function ChatSession({
  clientId,
  sessionId,
  onSent,
}: {
  clientId: string;
  sessionId: string;
  onSent: () => void;
}) {
  const [hasText, setHasText] = useState(false);
  const { messages, sendMessage, status, stop } = useChat(
    useChatTransport(
      api.chat,
      { sessionId, clientId },
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
    if (!text || isBusy || !clientId) return;
    sendMessage({ text });
    onSent();
    setHasText(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
