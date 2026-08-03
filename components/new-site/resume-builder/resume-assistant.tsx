"use client";

import { ArrowUp, Check, FileDown, Loader2, Sparkles, SquarePen, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useCallback } from "react";
import "streamdown/styles.css";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ui/shadcn-io/ai/message";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  type Message,
  type ResumeAssistantProps,
  useResumeAssistant,
} from "./use-resume-assistant";

export type { ResumeAssistantHandle } from "./use-resume-assistant";

const EXAMPLES = [
  "Tighten my professional summary.",
  "Make my most recent role's bullets more impactful.",
  "What should I emphasize for a senior role?",
];

function ExampleButton({ example, onSend }: { example: string; onSend: (text: string) => void }) {
  const handleClick = useCallback(() => onSend(example), [onSend, example]);

  return (
    <button
      className="rounded-lg border border-foreground/10 px-3 py-2 text-left text-muted-foreground text-xs transition-colors hover:border-foreground/20 hover:text-foreground"
      onClick={handleClick}
      type="button"
    >
      {example}
    </button>
  );
}

function EmptyTranscript({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-2 pt-2 text-sm">
      <p className="text-muted-foreground">
        I can rewrite your summary, competencies, and bullet points, and add roles, employers,
        education, or references from what you tell me. Try:
      </p>
      {EXAMPLES.map((ex) => (
        <ExampleButton key={ex} example={ex} onSend={onSend} />
      ))}
    </div>
  );
}

function MessageBody({ message }: { message: Message }) {
  if (!message.content) return null;
  if (message.role === "user") {
    return (
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground text-sm">
        {message.content}
      </div>
    );
  }
  return (
    <MessageResponse className="w-full text-foreground text-sm [&_li]:my-0.5 [&_ol]:my-1 [&_p]:my-1 [&_pre]:my-1 [&_pre]:text-xs [&_ul]:my-1">
      {message.content}
    </MessageResponse>
  );
}

function TranscriptMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn("flex flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}
    >
      <MessageBody message={message} />
      {message.changed ? (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Check className="size-3 text-primary" />
          {message.changed} change{message.changed > 1 ? "s" : ""} applied
        </span>
      ) : null}
      {message.imported ? (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <FileDown className="size-3 text-primary" />
          Résumé loaded into the form
        </span>
      ) : null}
    </div>
  );
}

function AssistantLauncher({ onOpen, reduce }: { onOpen: () => void; reduce: boolean | null }) {
  const fade = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 };

  return (
    <m.div
      animate={{ opacity: 1, scale: 1 }}
      className="fixed right-4 bottom-(--dock-clearance) z-30 lg:bottom-4"
      exit={fade}
      initial={fade}
      transition={{ duration: 0.15 }}
    >
      <Button
        className="translate-y-(--dock-shift) gap-1.5 rounded-full shadow-lg transition-transform duration-300 ease-out"
        onClick={onOpen}
        size="sm"
        type="button"
      >
        <Sparkles className="size-3.5" />
        Assistant
      </Button>
    </m.div>
  );
}

function AssistantPanel({
  input,
  isDesktop,
  messages,
  onClose,
  onInputChange,
  onKeyDown,
  onSend,
  pending,
  reduce,
  reset,
  scrollRef,
  send,
}: {
  input: string;
  isDesktop: boolean;
  messages: Message[];
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  pending: boolean;
  reduce: boolean | null;
  reset: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  send: (text: string) => void;
}) {
  const enter = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 };

  return (
    <m.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden border border-foreground/10 bg-background shadow-2xl",
        isDesktop
          ? "right-4 bottom-4 h-[min(40rem,calc(100dvh-2rem))] w-96 rounded-xl"
          : "inset-2 rounded-xl"
      )}
      exit={enter}
      initial={enter}
      style={{ transformOrigin: isDesktop ? "bottom right" : "bottom center" }}
      transition={
        reduce ? { duration: 0.15 } : { type: "spring", stiffness: 460, damping: 34, mass: 0.9 }
      }
    >
      <div className="flex shrink-0 items-center justify-between border-foreground/10 border-b px-3 py-2">
        <span className="flex items-center gap-1.5 font-medium text-sm">
          <Sparkles className="size-3.5 text-primary" />
          Résumé assistant
        </span>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 ? (
            <button
              aria-label="New chat"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              disabled={pending}
              onClick={reset}
              title="New chat"
              type="button"
            >
              <SquarePen className="size-4" />
            </button>
          ) : null}
          <button
            aria-label="Close assistant"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyTranscript onSend={send} />
        ) : (
          messages.map((message) => <TranscriptMessage key={message.id} message={message} />)
        )}
        {pending ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Thinking…
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-foreground/10 border-t p-2">
        <div className="flex items-end gap-1.5">
          <Textarea
            className="max-h-28 min-h-9 flex-1 resize-none py-2"
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder="Ask, or tell me what to change…"
            rows={1}
            value={input}
          />
          <Button
            aria-label="Send"
            className="size-9 shrink-0 rounded-full p-0"
            disabled={pending || !input.trim()}
            onClick={onSend}
            size="sm"
            type="button"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </div>
      </div>
    </m.div>
  );
}

export function ResumeAssistant(props: ResumeAssistantProps) {
  const { open, setOpen, messages, input, setInput, pending, scrollRef, send, reset } =
    useResumeAssistant(props);
  const isDesktop = useMediaQuery("(min-width: 1024px)", { initializeWithValue: false });
  const reduce = useReducedMotion();

  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const handleOpen = useCallback(() => setOpen(true), [setOpen]);
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value),
    [setInput]
  );
  const handleSend = useCallback(() => send(input), [send, input]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send(input);
      }
    },
    [send, input]
  );

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <AssistantPanel
          input={input}
          isDesktop={isDesktop}
          key="panel"
          messages={messages}
          onClose={handleClose}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          pending={pending}
          reduce={reduce}
          reset={reset}
          scrollRef={scrollRef}
          send={send}
        />
      ) : (
        <AssistantLauncher key="launcher" onOpen={handleOpen} reduce={reduce} />
      )}
    </AnimatePresence>
  );
}
