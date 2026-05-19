"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { unifiedMergeView } from "@codemirror/merge";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { langs } from "@uiw/codemirror-extensions-langs";
import {
  basicDark,
  basicLight,
  consoleDark,
  consoleLight,
  defaultSettingsBasicDark,
  defaultSettingsBasicLight,
  defaultSettingsConsoleDark,
  defaultSettingsConsoleLight,
  defaultSettingsDuotoneDark,
  defaultSettingsDuotoneLight,
  defaultSettingsGithubDark,
  defaultSettingsGithubLight,
  defaultSettingsGruvboxDark,
  defaultSettingsGruvboxLight,
  defaultSettingsMaterialDark,
  defaultSettingsMaterialLight,
  defaultSettingsSolarizedDark,
  defaultSettingsSolarizedLight,
  defaultSettingsTokyoNight,
  defaultSettingsTokyoNightDay,
  defaultSettingsVscodeDark,
  defaultSettingsVscodeLight,
  defaultSettingsWhiteDark,
  defaultSettingsWhiteLight,
  defaultSettingsXcodeDark,
  defaultSettingsXcodeLight,
  duotoneDark,
  duotoneLight,
  githubDark,
  githubLight,
  gruvboxDark,
  gruvboxLight,
  materialDark,
  materialLight,
  solarizedDark,
  solarizedLight,
  tokyoNight,
  tokyoNightDay,
  vscodeDark,
  vscodeLight,
  whiteDark,
  whiteLight,
  xcodeDark,
  xcodeLight,
} from "@uiw/codemirror-themes-all";
import CodeMirror from "@uiw/react-codemirror";
import { useAction, useQuery } from "convex/react";
import { Columns2, ExternalLink, FileIcon, Palette, Rows2, WrapText } from "lucide-react";
import { useMemo, useState } from "react";
import CodeMirrorMerge from "react-codemirror-merge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useTheme } from "@/lib/light-dark-providers";
import { cn } from "@/lib/utils";

type Commit = Doc<"commits">;

type FileEntry = {
  path: string;
  prevPath?: string;
  status: string;
  additions: number;
  deletions: number;
};

const Original = CodeMirrorMerge.Original;
const Modified = CodeMirrorMerge.Modified;

type ThemeSwatch = {
  background?: string;
  foreground?: string;
  selection?: string;
  lineHighlight?: string;
};

type ThemeOption = {
  key: string;
  label: string;
  light: Extension;
  dark: Extension;
  lightSwatch: ThemeSwatch;
  darkSwatch: ThemeSwatch;
};

const SWATCH_KEYS: (keyof ThemeSwatch)[] = ["background", "foreground", "selection"];

const THEMES: ThemeOption[] = [
  {
    key: "github",
    label: "GitHub",
    light: githubLight,
    dark: githubDark,
    lightSwatch: defaultSettingsGithubLight,
    darkSwatch: defaultSettingsGithubDark,
  },
  {
    key: "vscode",
    label: "VS Code",
    light: vscodeLight,
    dark: vscodeDark,
    lightSwatch: defaultSettingsVscodeLight,
    darkSwatch: defaultSettingsVscodeDark,
  },
  {
    key: "material",
    label: "Material",
    light: materialLight,
    dark: materialDark,
    lightSwatch: defaultSettingsMaterialLight,
    darkSwatch: defaultSettingsMaterialDark,
  },
  {
    key: "solarized",
    label: "Solarized",
    light: solarizedLight,
    dark: solarizedDark,
    lightSwatch: defaultSettingsSolarizedLight,
    darkSwatch: defaultSettingsSolarizedDark,
  },
  {
    key: "gruvbox",
    label: "Gruvbox",
    light: gruvboxLight,
    dark: gruvboxDark,
    lightSwatch: defaultSettingsGruvboxLight,
    darkSwatch: defaultSettingsGruvboxDark,
  },
  {
    key: "tokyo-night",
    label: "Tokyo Night",
    light: tokyoNightDay,
    dark: tokyoNight,
    lightSwatch: defaultSettingsTokyoNightDay,
    darkSwatch: defaultSettingsTokyoNight,
  },
  {
    key: "xcode",
    label: "Xcode",
    light: xcodeLight,
    dark: xcodeDark,
    lightSwatch: defaultSettingsXcodeLight,
    darkSwatch: defaultSettingsXcodeDark,
  },
  {
    key: "white",
    label: "White",
    light: whiteLight,
    dark: whiteDark,
    lightSwatch: defaultSettingsWhiteLight,
    darkSwatch: defaultSettingsWhiteDark,
  },
  {
    key: "basic",
    label: "Basic",
    light: basicLight,
    dark: basicDark,
    lightSwatch: defaultSettingsBasicLight,
    darkSwatch: defaultSettingsBasicDark,
  },
  {
    key: "duotone",
    label: "Duotone",
    light: duotoneLight,
    dark: duotoneDark,
    lightSwatch: defaultSettingsDuotoneLight,
    darkSwatch: defaultSettingsDuotoneDark,
  },
  {
    key: "console",
    label: "Console",
    light: consoleLight,
    dark: consoleDark,
    lightSwatch: defaultSettingsConsoleLight,
    darkSwatch: defaultSettingsConsoleDark,
  },
];

const THEME_BY_KEY = new Map(THEMES.map((t) => [t.key, t]));
const DEFAULT_THEME_KEY = "github";

const diffStripeTheme: Extension = EditorView.theme({
  "&, & .cm-scroller": {
    fontFamily: "var(--font-mono)",
  },
  "& .cm-changedLine, & .cm-insertedLine": {
    backgroundColor: "rgba(34,197,94,0.14)",
  },
  "& .cm-deletedLine, & .cm-deletedChunk": {
    backgroundColor: "rgba(239,68,68,0.14)",
  },
  "&.cm-merge-a .cm-changedText, &.cm-merge-a .cm-deletedChunk .cm-deletedText": {
    background: "rgba(239,68,68,0.15) !important",
    textDecoration: "none !important",
  },
  "&.cm-merge-b .cm-changedText": {
    background: "rgba(34,197,94,0.15) !important",
    textDecoration: "none !important",
  },
  "&.cm-merge-b .cm-deletedText": {
    background: "rgba(239,68,68,0.15) !important",
    textDecoration: "none !important",
  },
  "& .cm-changedLineGutter": {
    backgroundColor: "rgba(34,197,94,0.2)",
  },
  "& .cm-deletedLineGutter": {
    backgroundColor: "rgba(239,68,68,0.2)",
  },
});

const STATUS_COLOR: Record<string, string> = {
  added: "text-emerald-600 dark:text-emerald-400",
  removed: "text-red-600 dark:text-red-400",
  modified: "text-amber-600 dark:text-amber-400",
  renamed: "text-blue-600 dark:text-blue-400",
  copied: "text-blue-600 dark:text-blue-400",
  changed: "text-amber-600 dark:text-amber-400",
};

const EXT_TO_LANG: Record<string, keyof typeof langs> = {
  ts: "ts",
  tsx: "tsx",
  cts: "cts",
  mts: "mts",
  js: "js",
  mjs: "mjs",
  cjs: "cjs",
  jsx: "jsx",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  py: "python",
  go: "go",
  rs: "rs",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sh: "sh",
  bash: "bash",
};

const MARKDOWN_EXTS = new Set(["md", "mdx", "markdown"]);

function langForPath(path: string): Extension | null {
  const base = path.split("/").pop() ?? path;
  const ext = base.includes(".") ? base.split(".").pop()?.toLowerCase() : undefined;
  if (!ext) return null;
  if (MARKDOWN_EXTS.has(ext)) {
    return markdown({ base: markdownLanguage, codeLanguages: languages });
  }
  const key = EXT_TO_LANG[ext];
  if (!key) return null;
  try {
    return langs[key]();
  } catch {
    return null;
  }
}

export function CommitDiffDialog({
  commit,
  onOpenChange,
}: {
  commit: Commit | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = commit !== null;
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="flex h-[90vh] w-full max-w-[calc(100vw)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96vw,1800px)]">
        {commit ? <CommitDiffBody key={commit.sha} commit={commit} /> : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function CommitDiffBody({ commit }: { commit: Commit }) {
  const fetchCommitFiles = useAction(api.commits.fetchCommitFiles);
  const { resolvedTheme } = useTheme();
  const [themeKey, setThemeKey] = useLocalStorage<string>("commit-diff-theme", DEFAULT_THEME_KEY);
  const [wrapEnabled, setWrapEnabled] = useLocalStorage<boolean>("commit-diff-wrap", false);
  const [viewMode, setViewMode] = useLocalStorage<"split" | "unified">(
    "commit-diff-view-mode",
    "split"
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const cmTheme = useMemo<Extension>(() => {
    const t = THEME_BY_KEY.get(themeKey) ?? THEME_BY_KEY.get(DEFAULT_THEME_KEY);
    if (!t) return githubLight;
    return resolvedTheme === "dark" ? t.dark : t.light;
  }, [themeKey, resolvedTheme]);

  const fileList = useQuery(api.commits.getCachedFileList, { sha: commit.sha });

  useMountEffect(() => {
    fetchCommitFiles({ sha: commit.sha }).catch((e: unknown) => {
      setListError(e instanceof Error ? e.message : "Failed to load files");
    });
  });

  const effectivePath = selectedPath ?? fileList?.files[0]?.path ?? null;
  const selectedFile = fileList?.files.find((f) => f.path === effectivePath) ?? null;

  return (
    <>
      <ResponsiveDialogHeader className="space-y-1 border-b pt-2 pr-10 pb-2 pl-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <ResponsiveDialogTitle className="truncate text-sm">
              {commit.subject}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
              <span>{commit.shortSha}</span>
              <span aria-hidden>·</span>
              <span>
                {new Date(commit.authorDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {fileList ? (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {fileList.files.length} file{fileList.files.length === 1 ? "" : "s"}
                  </span>
                </>
              ) : null}
            </ResponsiveDialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setViewMode(viewMode === "split" ? "unified" : "split")}
                    aria-pressed={viewMode === "split"}
                    aria-label={
                      viewMode === "split" ? "Switch to unified view" : "Switch to split view"
                    }
                  >
                    {viewMode === "split" ? <Columns2 /> : <Rows2 />}
                  </Button>
                }
              />
              <TooltipContent>
                {viewMode === "split" ? "Split view" : "Unified view"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setWrapEnabled(!wrapEnabled)}
                    aria-pressed={wrapEnabled}
                    aria-label={wrapEnabled ? "Disable text wrapping" : "Enable text wrapping"}
                    className={cn(wrapEnabled && "bg-muted text-foreground")}
                  >
                    <WrapText />
                  </Button>
                }
              />
              <TooltipContent>
                {wrapEnabled ? "Disable text wrapping" : "Enable text wrapping"}
              </TooltipContent>
            </Tooltip>
            <CmThemePicker
              themeKey={themeKey}
              onChange={setThemeKey}
              resolvedTheme={resolvedTheme}
            />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    aria-label="View commit on GitHub"
                    render={
                      <a href={commit.url} target="_blank" rel="noreferrer">
                        <ExternalLink />
                      </a>
                    }
                  />
                }
              />
              <TooltipContent>View on GitHub</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </ResponsiveDialogHeader>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="shrink-0 overflow-x-auto overflow-y-auto border-b md:w-64 md:border-r md:border-b-0 lg:w-72">
          {listError ? (
            <p className="px-3 py-4 text-destructive text-xs">{listError}</p>
          ) : !fileList ? (
            <FileListSkeleton />
          ) : fileList.files.length === 0 ? (
            <p className="px-3 py-4 text-muted-foreground text-xs">No file changes.</p>
          ) : (
            <ul className="flex gap-1 p-2 md:flex-col md:gap-0.5">
              {fileList.files.map((f) => {
                const isActive = f.path === effectivePath;
                return (
                  <li key={f.path} className="shrink-0 md:shrink">
                    <button
                      type="button"
                      onClick={() => setSelectedPath(f.path)}
                      title={f.path}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        isActive ? "bg-muted text-foreground" : "hover:bg-muted/60"
                      )}
                    >
                      <FileIcon
                        className={cn(
                          "size-3.5 shrink-0",
                          STATUS_COLOR[f.status] ?? "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate font-mono">
                        {f.path.split("/").pop()}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground md:inline">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{f.additions}
                        </span>{" "}
                        <span className="text-red-600 dark:text-red-400">-{f.deletions}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {selectedFile ? (
            <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 font-mono text-muted-foreground text-xs">
              <span className={cn(STATUS_COLOR[selectedFile.status] ?? "text-muted-foreground")}>
                {selectedFile.status}
              </span>
              <span className="truncate" title={selectedFile.path}>
                {selectedFile.prevPath && selectedFile.prevPath !== selectedFile.path
                  ? `${selectedFile.prevPath} → ${selectedFile.path}`
                  : selectedFile.path}
              </span>
            </div>
          ) : null}
          <div className="min-h-0 min-w-0 flex-1 overflow-auto">
            {!selectedFile ? (
              <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                {fileList ? "Select a file" : "Loading…"}
              </p>
            ) : !fileList ? null : (
              <FileDiff
                key={`${commit.sha}:${selectedFile.path}`}
                commitSha={commit.sha}
                file={selectedFile}
                parentSha={fileList.parentSha}
                cmTheme={cmTheme}
                viewMode={viewMode}
                wrapEnabled={wrapEnabled}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FileDiff({
  commitSha,
  file,
  parentSha,
  cmTheme,
  viewMode,
  wrapEnabled,
}: {
  commitSha: string;
  file: FileEntry;
  parentSha: string;
  cmTheme: Extension;
  viewMode: "split" | "unified";
  wrapEnabled: boolean;
}) {
  const fetchFileBlobs = useAction(api.commits.fetchFileBlobs);
  const [blobError, setBlobError] = useState<string | null>(null);

  const wantBefore = file.status !== "added";
  const wantAfter = file.status !== "removed";
  const beforePath = file.prevPath ?? file.path;

  const cachedBefore = useQuery(
    api.commits.getCachedBlob,
    wantBefore && parentSha ? { ref: parentSha, path: beforePath } : "skip"
  );
  const cachedAfter = useQuery(
    api.commits.getCachedBlob,
    wantAfter ? { ref: commitSha, path: file.path } : "skip"
  );

  useMountEffect(() => {
    fetchFileBlobs({
      sha: commitSha,
      parentSha,
      path: file.path,
      prevPath: file.prevPath,
      status: file.status,
    }).catch((e: unknown) => {
      setBlobError(e instanceof Error ? e.message : "Failed to load file");
    });
  });

  const blobs = useMemo(() => {
    const beforeReady = !wantBefore || (cachedBefore !== undefined && cachedBefore !== null);
    const afterReady = !wantAfter || (cachedAfter !== undefined && cachedAfter !== null);
    if (!(beforeReady && afterReady)) return null;
    return {
      before: cachedBefore?.content ?? "",
      after: cachedAfter?.content ?? "",
      beforeTruncated: cachedBefore?.truncated ?? false,
      afterTruncated: cachedAfter?.truncated ?? false,
    };
  }, [wantBefore, wantAfter, cachedBefore, cachedAfter]);

  const langExt = useMemo(() => langForPath(file.path), [file.path]);
  const mergeExtensions = useMemo(() => {
    const base: Extension[] = [diffStripeTheme];
    if (langExt) base.unshift(langExt);
    if (wrapEnabled) base.push(EditorView.lineWrapping);
    return base;
  }, [langExt, wrapEnabled]);

  if (blobError) {
    return <p className="px-4 py-8 text-center text-destructive text-sm">{blobError}</p>;
  }
  if (!blobs) {
    return (
      <div className="space-y-2 px-4 py-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={`blob-skel-${i}`} className="h-4 w-full" />
        ))}
      </div>
    );
  }
  if (blobs.beforeTruncated || blobs.afterTruncated) {
    return (
      <p className="px-4 py-8 text-center text-muted-foreground text-sm">
        File too large to display. Open on GitHub.
      </p>
    );
  }
  if (file.status === "added" || file.status === "removed") {
    return (
      <CodeMirror
        value={file.status === "added" ? blobs.after : blobs.before}
        theme={cmTheme}
        extensions={mergeExtensions}
        editable={false}
        readOnly
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        className="text-xs"
      />
    );
  }
  if (viewMode === "unified") {
    return (
      <CodeMirror
        value={blobs.after}
        theme={cmTheme}
        extensions={[
          ...mergeExtensions,
          unifiedMergeView({
            original: blobs.before,
            highlightChanges: true,
            gutter: true,
            mergeControls: false,
          }),
        ]}
        editable={false}
        readOnly
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        className="text-xs"
      />
    );
  }
  return (
    <CodeMirrorMerge
      theme={cmTheme}
      className="text-xs"
      gutter
      highlightChanges
      collapseUnchanged={{ margin: 3, minSize: 6 }}
    >
      <Original value={blobs.before} extensions={mergeExtensions} readOnly />
      <Modified value={blobs.after} extensions={mergeExtensions} readOnly />
    </CodeMirrorMerge>
  );
}

function FileListSkeleton() {
  return (
    <div className="space-y-1.5 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={`file-skel-${i}`} className="h-7 w-full" />
      ))}
    </div>
  );
}

function ThemePalette({ theme }: { theme: ThemeOption }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      {SWATCH_KEYS.map((key) => (
        <div
          key={key}
          className="inset-ring-1 inset-ring-foreground/15 flex h-4 w-2.5 shrink-0 rounded-xs bg-(--swatch) dark:bg-(--swatch-dark)"
          style={
            {
              "--swatch": theme.lightSwatch[key] ?? "transparent",
              "--swatch-dark": theme.darkSwatch[key] ?? "transparent",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function CmThemePicker({
  themeKey,
  onChange,
  resolvedTheme,
}: {
  themeKey: string;
  onChange: (key: string) => void;
  resolvedTheme: string;
}) {
  const selected = THEME_BY_KEY.get(themeKey) ?? THEMES[0];
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Editor theme">
                  <Palette />
                </Button>
              }
            />
          }
        />
        <TooltipContent>Editor theme: {selected.label}</TooltipContent>
      </Tooltip>
      <PopoverContent className="rounded-2xl p-0" align="end" alignOffset={-8}>
        <Command
          className={cn(
            "**:data-[slot=command-input-wrapper]:h-10 **:[[cmdk-input]]:h-9",
            "**:[[cmdk-group]]:px-2",
            "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
            "**:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2"
          )}
        >
          <CommandInput placeholder="Search theme…" />
          {selected ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm">
                <ThemePalette theme={selected} />
                <span className="truncate font-medium">{selected.label}</span>
                <span className="ml-auto rounded-md bg-foreground/10 px-1.5 py-0.5 font-medium text-[10px] text-foreground/60 uppercase tracking-wide">
                  {resolvedTheme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
              <CommandSeparator />
            </>
          ) : null}
          <CommandList className="scrollbar-thin max-h-72 [&::-webkit-scrollbar]:block">
            <CommandEmpty>No themes found.</CommandEmpty>
            <CommandGroup heading={`Themes (${THEMES.length})`}>
              {THEMES.map((t) => (
                <CommandItem
                  key={t.key}
                  value={t.label}
                  data-checked={themeKey === t.key}
                  onSelect={() => onChange(t.key)}
                >
                  <ThemePalette theme={t} />
                  {t.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
