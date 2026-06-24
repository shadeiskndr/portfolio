"use client";

import { useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { useMountEffect } from "@/hooks/use-mount-effect";

// Double-quoted lines so backticks and ${} inside the fenced code stay literal
// — no template-literal escaping. The sample deliberately ends mid-construct.
const SAMPLE = [
  "## Streaming markdown, mid-flight",
  "",
  "The model is **still generating this** answer, and the buffer",
  "currently ends inside an unclosed bold span — yet nothing breaks.",
  "",
  "- first point, fully formed",
  "- second point, still strea",
  "",
  "```ts",
  "function greet(name: string) {",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal markdown code sample, not a template string
  "  return `hello, ${name}`;",
  "}",
  "```",
  "",
  "And a [link that hasn't closed yet](https://exam",
].join("\n");

const STEP = 2;
const INTERVAL = 28;

/** Scrub or play a half-streamed markdown buffer; the rendered pane never breaks. */
export function StreamRevealDemo() {
  const max = SAMPLE.length;
  const [count, setCount] = useState(max);
  const [playing, setPlaying] = useState(false);
  const countRef = useRef(max);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const setBoth = (n: number) => {
    countRef.current = n;
    setCount(n);
  };
  const step = () => {
    const next = Math.min(countRef.current + STEP, max);
    setBoth(next);
    if (next >= max) {
      setPlaying(false);
      clear();
      return;
    }
    timer.current = setTimeout(step, INTERVAL);
  };
  const play = () => {
    clear();
    if (countRef.current >= max) setBoth(0);
    setPlaying(true);
    timer.current = setTimeout(step, INTERVAL);
  };
  const pause = () => {
    clear();
    setPlaying(false);
  };
  const onScrub = (n: number) => {
    pause();
    setBoth(n);
  };

  // The lone external system here is the timer; tear it down on unmount.
  useMountEffect(() => () => clear());

  const revealed = SAMPLE.slice(0, count);

  return (
    <div className="my-6 overflow-hidden rounded-xl border">
      <div className="flex items-center gap-3 border-b p-2">
        <Button size="sm" variant="outline" onClick={() => (playing ? pause() : play())}>
          {playing ? "Pause" : count >= max ? "Replay" : "Play"}
        </Button>
        <input
          aria-label="Scrub stream position"
          type="range"
          min={0}
          max={max}
          value={count}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-primary"
        />
        <span className="w-14 shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums">
          {count}/{max}
        </span>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="min-w-0 border-b p-4 md:border-r md:border-b-0">
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Rendered
          </p>
          <div className="min-h-[220px] text-sm [&_code]:font-mono [&_h2]:mt-0 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:text-base [&_li]:leading-relaxed [&_p]:my-2 [&_pre]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
            <Streamdown>{revealed}</Streamdown>
          </div>
        </div>
        <div className="min-w-0 p-4">
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Raw buffer
          </p>
          <pre className="min-h-[220px] overflow-x-auto whitespace-pre-wrap break-words font-mono text-muted-foreground text-xs">
            {revealed}
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-primary align-baseline" />
          </pre>
        </div>
      </div>
    </div>
  );
}
