"use client";

import { EditorView } from "@codemirror/view";
import { langs } from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-themes-all";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/light-dark-providers";

const LANGS = {
  tsx: { label: "TypeScript", ext: () => langs.tsx() },
  python: { label: "Python", ext: () => langs.python() },
  json: { label: "JSON", ext: () => langs.json() },
} as const;

type LangKey = keyof typeof LANGS;

const SAMPLES: Record<LangKey, string> = {
  tsx: `import { useState } from "react";

// CodeMirror is assembled from small extensions —
// language, theme, keymaps — not one monolithic bundle.
export function Counter({ start = 0 }: { start?: number }) {
  const [n, setN] = useState(start);
  return <button onClick={() => setN((v) => v + 1)}>count: {n}</button>;
}`,
  python: `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

    def distance(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5`,
  json: `{
  "editor": "codemirror",
  "extensions": ["language", "theme", "keymap"],
  "shipped-as-many-small-modules": true,
  "monaco": false
}`,
};

/** A live, editable CodeMirror instance — the editor this post migrated to. */
export function CodeMirrorDemo() {
  const { resolvedTheme } = useTheme();
  const [lang, setLang] = useState<LangKey>("tsx");
  const [buffers, setBuffers] = useState<Record<LangKey, string>>(SAMPLES);
  const [wrap, setWrap] = useState(false);

  const theme = resolvedTheme === "dark" ? githubDark : githubLight;
  const extensions = useMemo(
    () => [LANGS[lang].ext(), ...(wrap ? [EditorView.lineWrapping] : [])],
    [lang, wrap]
  );

  return (
    <div className="my-6 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        {(Object.keys(LANGS) as LangKey[]).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={lang === k ? "default" : "ghost"}
            onClick={() => setLang(k)}
          >
            {LANGS[k].label}
          </Button>
        ))}
        <Button
          className="ml-auto"
          size="sm"
          variant={wrap ? "default" : "ghost"}
          onClick={() => setWrap((w) => !w)}
        >
          Wrap
        </Button>
      </div>
      <CodeMirror
        value={buffers[lang]}
        theme={theme}
        extensions={extensions}
        onChange={(val) => setBuffers((b) => ({ ...b, [lang]: val }))}
        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
        className="text-sm"
      />
    </div>
  );
}
