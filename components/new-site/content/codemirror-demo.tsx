"use client";

import { langs } from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-themes-all";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

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

function LangButton({
  langKey,
  active,
  onSelect,
}: {
  langKey: LangKey;
  active: boolean;
  onSelect: (key: LangKey) => void;
}) {
  const handleClick = useCallback(() => onSelect(langKey), [onSelect, langKey]);

  return (
    <Button size="sm" variant={active ? "default" : "ghost"} onClick={handleClick}>
      {LANGS[langKey].label}
    </Button>
  );
}

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

  const handleToggleWrap = useCallback(() => setWrap((w) => !w), []);
  const handleChange = useCallback(
    (val: string) => setBuffers((b) => ({ ...b, [lang]: val })),
    [lang]
  );

  return (
    <div className="my-6 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        {(Object.keys(LANGS) as LangKey[]).map((k) => (
          <LangButton key={k} langKey={k} active={lang === k} onSelect={setLang} />
        ))}
        <Button
          className="ml-auto"
          size="sm"
          variant={wrap ? "default" : "ghost"}
          onClick={handleToggleWrap}
        >
          Wrap
        </Button>
      </div>
      <CodeMirror
        value={buffers[lang]}
        theme={theme}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
        className="text-sm"
      />
    </div>
  );
}
