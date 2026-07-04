"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

type Msg = { id: number; role: "user" | "assistant" | "tool"; text: string };
type Phase = "idle" | "running" | "awaiting" | "done";

const QUESTION = "Which source should I summarize from?";
const OPTIONS = ["Finance export", "Shared drive"];

/** A mock turn that streams, calls `ask_user`, blocks for your answer, then resumes. */
export function AskUserDemo() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  const clear = () => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  };
  const push = (m: Omit<Msg, "id">) => {
    const id = nextId.current++;
    setMessages((xs) => [...xs, { ...m, id }]);
  };
  const after = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const run = () => {
    clear();
    setPhase("running");
    setMessages([
      { id: nextId.current++, role: "user", text: "Summarize last quarter's numbers." },
    ]);
    after(500, () => push({ role: "assistant", text: "I can pull these from two places." }));
    after(1300, () => {
      push({ role: "tool", text: `ask_user — ${QUESTION}` });
      setPhase("awaiting");
    });
  };

  const answer = (choice: string) => {
    push({ role: "user", text: choice });
    setPhase("running");
    after(500, () =>
      push({ role: "assistant", text: `Reading from the ${choice.toLowerCase()}…` })
    );
    after(1500, () => {
      push({ role: "assistant", text: "Done — here's the summary." });
      setPhase("done");
    });
  };

  const skip = () => {
    push({ role: "assistant", text: "No preference given — I'll use my best judgment." });
    setPhase("running");
    after(1200, () => {
      push({ role: "assistant", text: "Done — here's the summary." });
      setPhase("done");
    });
  };

  const reset = () => {
    clear();
    setMessages([]);
    setPhase("idle");
  };

  useMountEffect(() => () => clear());

  return (
    <div className="my-6 rounded-xl border">
      <div className="flex items-center gap-2 border-b p-2">
        <Button size="sm" variant="outline" onClick={phase === "idle" ? run : reset}>
          {phase === "idle" ? "Run the turn" : "Reset"}
        </Button>
        <span className="ml-auto font-mono text-muted-foreground text-xs">
          {phase === "awaiting"
            ? "stream paused — waiting on you"
            : phase === "running"
              ? "streaming…"
              : phase === "done"
                ? "turn complete"
                : "idle"}
        </span>
      </div>
      <div className="min-h-[220px] space-y-2 p-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Press run to start a turn.</p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            {m.role === "tool" ? (
              <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-amber-600 text-xs dark:text-amber-400">
                🔧 {m.text}
              </span>
            ) : (
              <span
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {m.text}
              </span>
            )}
          </div>
        ))}

        {phase === "awaiting" ? (
          <div className="mt-3 rounded-lg border bg-card p-3">
            <p className="mb-2 font-medium text-sm">{QUESTION}</p>
            <div className="flex flex-wrap gap-2">
              {OPTIONS.map((o) => (
                <Button key={o} size="sm" variant="outline" onClick={() => answer(o)}>
                  {o}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={skip}>
                Skip
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
