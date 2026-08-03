import type { Ref } from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import type { ResumeEdit } from "@/convex/resumeChat";
import type { ResumeData } from "@/lib/resume/schema";

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  changed?: number;
  imported?: boolean;
};

type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "edits"; edits: ResumeEdit[] }
  | { type: "resume"; resume: ResumeData; method: "deterministic" | "ai" }
  | { type: "error"; error: string };

export interface ResumeAssistantHandle {
  startImport: (source: string, format: "tex" | "docx" | "text", label: string) => void;
  startTailor: (jobDescription: string) => void;
}

export interface ResumeAssistantProps {
  getResume: () => ResumeData;
  applyEdits: (edits: ResumeEdit[]) => number;
  applyResume: (resume: ResumeData, method: "deterministic" | "ai") => void;
  ref?: Ref<ResumeAssistantHandle>;
}

const base = process.env["NEXT_PUBLIC_CONVEX_SITE_URL"];
const CHAT_URL = base ? `${base}/resume-chat` : null;
const IMPORT_URL = base ? `${base}/resume-import` : null;
const TAILOR_URL = base ? `${base}/resume-tailor` : null;

export function useResumeAssistant({
  getResume,
  applyEdits,
  applyResume,
  ref,
}: ResumeAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    if (messages.length === 0 && !pending) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  const patch = (id: number, fields: Partial<Message>) =>
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, ...fields } : msg)));

  async function runStream(url: string, payload: unknown, replyId: number): Promise<string> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let acc = "";
    let done = false;
    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const line = frame.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        const data = line.slice("data: ".length);
        if (data === "[DONE]") {
          done = true;
          break;
        }
        const evt = JSON.parse(data) as StreamEvent;
        if (evt.type === "text") {
          acc += evt.delta;
          patch(replyId, { content: acc });
        } else if (evt.type === "edits") {
          patch(replyId, { changed: applyEdits(evt.edits) });
        } else if (evt.type === "resume") {
          applyResume(evt.resume, evt.method);
          patch(replyId, { imported: true });
        } else if (evt.type === "error") {
          throw new Error(evt.error);
        }
      }
    }
    return acc;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;
    const history = [
      ...messages,
      { id: nextId.current++, role: "user" as const, content: trimmed },
    ];
    setMessages(history);
    setInput("");
    busyRef.current = true;
    setPending(true);
    const replyId = nextId.current++;
    setMessages((m) => [...m, { id: replyId, role: "assistant", content: "" }]);

    try {
      if (!CHAT_URL) throw new Error("Assistant endpoint is not configured.");
      const acc = await runStream(
        CHAT_URL,
        {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          resume: getResume(),
        },
        replyId
      );
      patch(replyId, { content: acc.trim() || "Done — I updated your résumé." });
    } catch (e) {
      patch(replyId, { content: "Sorry — something went wrong. Please try again." });
      toast.error(e instanceof Error ? e.message : "Assistant request failed.");
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  async function runDialogTurn(
    userContent: string,
    url: string | null,
    body: unknown,
    fallback: string
  ) {
    if (busyRef.current) return;
    setOpen(true);
    const userId = nextId.current++;
    const replyId = nextId.current++;
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: userContent },
      { id: replyId, role: "assistant", content: "" },
    ]);
    busyRef.current = true;
    setPending(true);

    try {
      if (!url) throw new Error("This endpoint is not configured.");
      const acc = await runStream(url, body, replyId);
      patch(replyId, { content: acc.trim() || fallback });
    } catch (e) {
      patch(replyId, { content: "Sorry — something went wrong. Please try again." });
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  }

  function startImport(source: string, format: "tex" | "docx" | "text", label: string) {
    void runDialogTurn(
      `Import my résumé from “${label}”.`,
      IMPORT_URL,
      { source, format },
      "I've imported your résumé — take a look at the preview."
    );
  }

  function startTailor(jobDescription: string) {
    const jd = jobDescription.trim();
    const preview = jd.slice(0, 220);
    void runDialogTurn(
      `Tailor my résumé to this job:\n\n${preview}${jd.length > 220 ? "…" : ""}`,
      TAILOR_URL,
      { jobDescription: jd, resume: getResume() },
      "I've tailored your résumé to the job — check the summary and skill order."
    );
  }

  function reset() {
    if (busyRef.current) return;
    setMessages([]);
    setInput("");
    nextId.current = 0;
  }

  const latest = useRef<ResumeAssistantHandle>({ startImport, startTailor });
  useEffect(() => {
    latest.current = { startImport, startTailor };
  });

  useImperativeHandle(
    ref,
    () => ({
      startImport: (source, format, label) => latest.current.startImport(source, format, label),
      startTailor: (jobDescription) => latest.current.startTailor(jobDescription),
    }),
    []
  );

  return { open, setOpen, messages, input, setInput, pending, scrollRef, send, reset };
}
