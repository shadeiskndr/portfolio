"use client";

import { useChat } from "@ai-sdk/react";
import { useChatTransport } from "@convex-dev/agent/vercel/react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { createMathPlugin } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { type DynamicToolUIPart, getToolName, isToolUIPart, type ToolUIPart } from "ai";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import { useMutation, useQuery } from "convex/react";
import { ArrowDownIcon, BrainIcon, CheckIcon, Plus, SparklesIcon, Trash2Icon } from "lucide-react";
import { type ReactNode, useId, useMemo, useRef, useState } from "react";
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
import TypewriterTitle from "@/components/ui/kokonutui/type-writer";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
} from "@/components/ui/shadcn-io/ai/context";
import { Message, MessageContent, MessageResponse } from "@/components/ui/shadcn-io/ai/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/shadcn-io/ai/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/shadcn-io/ai/tool";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { usePersistentId } from "@/hooks/use-persistent-id";
import { type ChatModel, DEFAULT_REASONING } from "@/lib/chat/models";
import { cn } from "@/lib/utils";

const streamdownPlugins = {
  code,
  math: createMathPlugin({ singleDollarTextMath: true }),
  mermaid,
  cjk,
};

const CHAT_ANIMATION = {
  animation: "blurIn" as const,
  sep: "word" as const,
  duration: 150,
  easing: "ease-out",
};

const CLIENT_ID_KEY = "portfolio-chat-client-id";
const SESSION_ID_KEY = "portfolio-chat-session-id";
const MODEL_ID_KEY = "portfolio-chat-model-id";
const REASONING_KEY = "portfolio-chat-reasoning";

const EMPTY_STORAGE_OPTIONS = {};

const HERO_SEQUENCES = [
  { text: "Where should we start?", deleteAfter: true },
  { text: "What's on your mind?", deleteAfter: true },
  { text: "How can I help?", deleteAfter: true },
  { text: "Ask me anything.", deleteAfter: true },
];

const COMPOSER_CARD =
  "border-radius border-border/60 bg-background p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.22)] transition-shadow focus-within:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_20px_44px_-10px_rgba(0,0,0,0.30)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_20px_44px_-10px_rgba(0,0,0,0.30)] has-[[data-slot=input-group-control]:focus-visible]:border-border/60 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-disabled:bg-background has-disabled:opacity-100 dark:bg-background dark:has-disabled:bg-background dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_28px_-8px_rgba(0,0,0,0.6)]";

type AnyToolPart = ToolUIPart | DynamicToolUIPart;

type MergedToolCall = {
  toolCallId: string;
  toolName: string;
  state: ToolUIPart["state"];
  input: unknown;
  output: unknown;
  errorText?: string;
};

const TOOL_STATE_RANK: Record<ToolUIPart["state"], number> = {
  "input-streaming": 0,
  "input-available": 1,
  "approval-requested": 2,
  "approval-responded": 3,
  "output-available": 4,
  "output-error": 4,
  "output-denied": 4,
};

function mergeToolPart(prev: MergedToolCall | undefined, part: AnyToolPart): MergedToolCall {
  const output = (part as { output?: unknown }).output;
  const errorText = (part as { errorText?: string }).errorText;
  const state =
    prev && TOOL_STATE_RANK[prev.state] > TOOL_STATE_RANK[part.state] ? prev.state : part.state;
  return {
    toolCallId: part.toolCallId,
    toolName: getToolName(part),
    state,
    input: (part as { input?: unknown }).input ?? prev?.input,
    output: output ?? prev?.output,
    errorText: errorText ?? prev?.errorText,
  };
}

function ModelSelector({
  models,
  labels,
  value,
  onChange,
}: {
  models: readonly ChatModel[];
  labels: Record<string, string>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <PromptInputSelect
      items={labels}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onChange(next);
        }
      }}
      value={value}
    >
      <PromptInputSelectTrigger aria-label="Model" className="h-8 gap-1 px-2 text-xs">
        <PromptInputSelectValue />
      </PromptInputSelectTrigger>
      <PromptInputSelectContent align="start" className="min-w-56">
        {models.map((model) => (
          <PromptInputSelectItem key={model.id} value={model.id}>
            <span className="flex flex-col">
              <span className="font-medium text-foreground">{model.name}</span>
              <span className="text-muted-foreground text-xs">{model.provider}</span>
            </span>
          </PromptInputSelectItem>
        ))}
      </PromptInputSelectContent>
    </PromptInputSelect>
  );
}

function ReasoningToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <label
      className="flex h-8 cursor-pointer select-none items-center gap-1.5 px-2 text-muted-foreground text-xs"
      htmlFor={id}
    >
      <BrainIcon className="size-3.5" />
      <span className="hidden pt-0.5 sm:inline">Reasoning</span>
      <Switch checked={on} id={id} onCheckedChange={onChange} size="sm" />
    </label>
  );
}

export default function Chat() {
  const clientId = usePersistentId(CLIENT_ID_KEY);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string>(
    SESSION_ID_KEY,
    () => uuidv7(),
    EMPTY_STORAGE_OPTIONS
  );
  const [modelId, setModelId] = useLocalStorage<string | null>(MODEL_ID_KEY, null, {
    initializeWithValue: false,
  });
  const [reasoning, setReasoning] = useLocalStorage<boolean>(REASONING_KEY, DEFAULT_REASONING, {
    initializeWithValue: false,
  });
  const modelData = useQuery(api.chat.models, {});
  const models = modelData?.models;
  const modelLabels = useMemo(
    () => Object.fromEntries((models ?? []).map((model) => [model.id, model.name])),
    [models]
  );
  const activeModel =
    models?.find((model) => model.id === modelId) ??
    models?.find((model) => model.id === modelData?.defaultId);
  const selectedModelId = activeModel?.id;
  const sessions = useQuery(api.sessions.list, clientId ? { clientId } : "skip");
  const usage = useQuery(
    api.chat.usage,
    clientId ? { sessionId: activeSessionId, clientId } : "skip"
  );
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

  const controls = (
    <div className="flex items-center gap-0.5">
      {models && selectedModelId ? (
        <ModelSelector
          labels={modelLabels}
          models={models}
          onChange={setModelId}
          value={selectedModelId}
        />
      ) : (
        <Button
          aria-label="Model"
          className="h-8 gap-1 px-2 text-muted-foreground text-xs"
          disabled
          size="sm"
          type="button"
          variant="ghost"
        >
          Model
        </Button>
      )}

      {activeModel?.supportsReasoning ? (
        <ReasoningToggle on={reasoning} onChange={setReasoning} />
      ) : null}

      <Button
        className="text-muted-foreground"
        onClick={handleNewChat}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Plus className="size-3" />
        <span className="hidden pt-0.5 sm:inline">New chat</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
        >
          <span className="pt-0.5">Chats</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64" side="top">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Recent chats</DropdownMenuLabel>
            {sessions === undefined ? (
              <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
            ) : sessions.length === 0 ? (
              <DropdownMenuItem disabled>No saved chats yet</DropdownMenuItem>
            ) : (
              sessions.map((session) => (
                <DropdownMenuItem
                  className={cn("gap-2", session.sessionId === activeSessionId && "font-medium")}
                  key={session.sessionId}
                  onClick={() => handleSelectSession(session.sessionId)}
                >
                  <CheckIcon
                    className={cn(
                      "size-3.5 shrink-0",
                      session.sessionId === activeSessionId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate">{session.title ?? "New chat"}</span>
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

      {usage ? (
        <Context
          cost={usage.cost}
          maxTokens={usage.maxTokens}
          usage={usage.usage}
          usedPercent={usage.usedPercent}
          usedTokens={usage.usedTokens}
        >
          <ContextTrigger />
          <ContextContent>
            <ContextContentHeader />
            <ContextContentBody>
              <ContextInputUsage />
              <ContextOutputUsage />
              <ContextCacheUsage />
            </ContextContentBody>
            <ContextContentFooter />
          </ContextContent>
        </Context>
      ) : null}
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatSession
        clientId={clientId}
        key={activeSessionId}
        modelId={selectedModelId}
        onSent={() => setActiveSessionId(activeSessionId)}
        reasoning={reasoning}
        sessionId={activeSessionId}
        toolbar={controls}
      />
    </div>
  );
}

function ChatSession({
  clientId,
  sessionId,
  modelId,
  reasoning,
  onSent,
  toolbar,
}: {
  clientId: string;
  sessionId: string;
  modelId: string | undefined;
  reasoning: boolean;
  onSent: () => void;
  toolbar: ReactNode;
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

  const { scrollToBottom, showScrollButton } = useWindowStickToBottom();

  const toolCalls = useMemo(() => {
    const byId = new Map<string, MergedToolCall>();
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === "dynamic-tool" || isToolUIPart(part)) {
          const toolPart = part as AnyToolPart;
          byId.set(toolPart.toolCallId, mergeToolPart(byId.get(toolPart.toolCallId), toolPart));
        }
      }
    }
    return byId;
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text?.trim();
    if (!text || isBusy || !clientId) return;
    sendMessage({ text }, { body: { modelId, reasoning } });
    onSent();
    setHasText(false);
    scrollToBottom();
  }

  const composer = (
    <PromptInput className={COMPOSER_CARD} onSubmit={handleSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          className="min-h-18"
          onChange={(e) => setHasText(e.target.value.trim().length > 0)}
          placeholder="Ask anything"
        />
      </PromptInputBody>
      <PromptInputFooter className="justify-between">
        {toolbar}
        <PromptInputSubmit
          disabled={!isBusy && !hasText}
          onClick={isBusy ? () => stop() : undefined}
          status={status}
          type={isBusy ? "button" : "submit"}
        />
      </PromptInputFooter>
    </PromptInput>
  );

  if (isEmpty) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-8 pb-[15vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <SparklesIcon className="size-4 text-primary" />
            Hi there
          </span>
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
            <TypewriterTitle
              autoLoop
              inline
              loopDelay={1000}
              pauseBeforeDelete={10000}
              sequences={HERO_SEQUENCES}
              typingSpeed={100}
            />
          </h1>
        </div>
        {composer}
      </div>
    );
  }

  const renderedToolCallIds = new Set<string>();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-8 px-4 pb-16" role="log">
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
                        <ReasoningContent
                          animated={CHAT_ANIMATION}
                          isAnimating={isStreaming}
                          plugins={streamdownPlugins}
                        >
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
                        animated={CHAT_ANIMATION}
                        isAnimating={isStreaming}
                        key={key}
                        plugins={streamdownPlugins}
                      >
                        {part.text}
                      </MessageResponse>
                    );
                  }
                  if (part.type === "dynamic-tool" || isToolUIPart(part)) {
                    const id = (part as AnyToolPart).toolCallId;
                    if (renderedToolCallIds.has(id)) {
                      return null;
                    }
                    renderedToolCallIds.add(id);
                    const tool = toolCalls.get(id);
                    if (!tool) {
                      return null;
                    }
                    return (
                      <Tool key={key}>
                        <ToolHeader
                          state={tool.state}
                          title={tool.toolName}
                          type={`tool-${tool.toolName}`}
                        />
                        <ToolContent>
                          <ToolInput input={tool.input} />
                          <ToolOutput errorText={tool.errorText} output={tool.output} />
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          );
        })}
      </div>

      <div className="sticky bottom-0 z-20 bg-background/80 pb-(--dock-clearance) backdrop-blur-xl supports-backdrop-filter:bg-background/60 lg:pb-4">
        <div className="translate-y-(--dock-shift) transition-transform duration-300 ease-out">
          {showScrollButton ? (
            <Button
              aria-label="Scroll to bottom"
              className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full shadow-sm"
              onClick={scrollToBottom}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowDownIcon className="size-4" />
            </Button>
          ) : null}
          {composer}
        </div>
      </div>
    </div>
  );
}

function useWindowStickToBottom() {
  const shouldStick = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useMountEffect(() => {
    const doc = document.documentElement;
    const BOTTOM_THRESHOLD = 120;
    const isAtBottom = () =>
      doc.scrollHeight - window.scrollY - window.innerHeight <= BOTTOM_THRESHOLD;

    const syncFromScroll = () => {
      const atBottom = isAtBottom();
      shouldStick.current = atBottom;
      setShowScrollButton(!atBottom);
    };

    const observer = new ResizeObserver(() => {
      if (shouldStick.current) {
        window.scrollTo({ top: doc.scrollHeight });
      }
      setShowScrollButton(!isAtBottom());
    });

    window.addEventListener("scroll", syncFromScroll, { passive: true });
    observer.observe(document.body);
    window.scrollTo({ top: doc.scrollHeight });

    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      observer.disconnect();
    };
  });

  function scrollToBottom() {
    shouldStick.current = true;
    setShowScrollButton(false);
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }

  return { scrollToBottom, showScrollButton };
}
