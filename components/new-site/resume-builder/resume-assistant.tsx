"use client";

import { ArrowUp, Check, FileDown, Loader2, Sparkles, SquarePen, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import "streamdown/styles.css";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ui/shadcn-io/ai/message";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { type ResumeAssistantProps, useResumeAssistant } from "./use-resume-assistant";

export type { ResumeAssistantHandle } from "./use-resume-assistant";

const EXAMPLES = [
  "Tighten my professional summary.",
  "Make my most recent role's bullets more impactful.",
  "What should I emphasize for a senior role?",
];

// Floating, docked résumé assistant panel. Presentation only — the conversation
// state and SSE streaming (free-form chat + Import/Tailor dialog handoffs) live in
// useResumeAssistant. Assistant replies render as streamdown markdown (no bubble),
// user messages stay plain-text bubbles.
export function ResumeAssistant(props: ResumeAssistantProps) {
  const { open, setOpen, messages, input, setInput, pending, scrollRef, send, reset } =
    useResumeAssistant(props);
  const isDesktop = useMediaQuery("(min-width: 1024px)", { initializeWithValue: false });
  // Respect the OS "reduce motion" setting — fall back to a plain fade with no
  // scale/translate for both the launcher and the panel.
  const reduce = useReducedMotion();

  // Both states live inside one AnimatePresence so the leaving element (launcher
  // or panel) animates OUT before it unmounts — an early return per state would
  // swap them instantly. initial={false} skips the enter animation on first
  // paint (no pop-in on page load) while still animating every open/close after.
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "fixed z-30 flex flex-col overflow-hidden border border-foreground/10 bg-background shadow-2xl",
            isDesktop
              ? "right-4 bottom-4 h-[min(40rem,calc(100dvh-2rem))] w-96 rounded-xl"
              : "inset-2 rounded-xl"
          )}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          key="panel"
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
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 pt-2 text-sm">
                <p className="text-muted-foreground">
                  I can rewrite your summary, competencies, and bullet points, and add roles,
                  employers, education, or references from what you tell me. Try:
                </p>
                {EXAMPLES.map((ex) => (
                  <button
                    className="rounded-lg border border-foreground/10 px-3 py-2 text-left text-muted-foreground text-xs transition-colors hover:border-foreground/20 hover:text-foreground"
                    key={ex}
                    onClick={() => send(ex)}
                    type="button"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m) => (
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                  key={m.id}
                >
                  {m.content ? (
                    m.role === "user" ? (
                      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground text-sm">
                        {m.content}
                      </div>
                    ) : (
                      <MessageResponse className="w-full text-foreground text-sm [&_li]:my-0.5 [&_ol]:my-1 [&_p]:my-1 [&_pre]:my-1 [&_pre]:text-xs [&_ul]:my-1">
                        {m.content}
                      </MessageResponse>
                    )
                  ) : null}
                  {m.changed ? (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Check className="size-3 text-primary" />
                      {m.changed} change{m.changed > 1 ? "s" : ""} applied
                    </span>
                  ) : null}
                  {m.imported ? (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <FileDown className="size-3 text-primary" />
                      Résumé loaded into the form
                    </span>
                  ) : null}
                </div>
              ))
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask, or tell me what to change…"
                rows={1}
                value={input}
              />
              <Button
                aria-label="Send"
                className="size-9 shrink-0 rounded-full p-0"
                disabled={pending || !input.trim()}
                onClick={() => send(input)}
                size="sm"
                type="button"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </m.div>
      ) : (
        <m.div
          animate={{ opacity: 1, scale: 1 }}
          className="fixed right-4 bottom-4 z-30"
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          key="launcher"
          transition={{ duration: 0.15 }}
        >
          <Button
            className="gap-1.5 rounded-full shadow-lg"
            onClick={() => setOpen(true)}
            size="sm"
            type="button"
          >
            <Sparkles className="size-3.5" />
            Assistant
          </Button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
