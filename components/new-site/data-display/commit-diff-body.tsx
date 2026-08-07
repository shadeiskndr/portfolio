"use client";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { unifiedMergeView } from "@codemirror/merge";
import type { Extension } from "@codemirror/state";
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
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useAction, useQuery } from "convex/react";
import {
  Columns2,
  ExternalLink,
  FileIcon,
  Palette,
  Rows2,
  Search,
  WrapText,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/ui/kibo-ui/tree";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type Commit = Doc<"commits">;

type FileEntry = {
  path: string;
  prevPath?: string | undefined;
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

const THEMES: [ThemeOption, ...ThemeOption[]] = [
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

const EMPTY_STORAGE_OPTIONS = {};

const COMMIT_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

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

type TreeFileNode = { type: "file"; name: string; path: string; file: FileEntry };
type TreeFolderNode = {
  type: "folder";
  name: string;
  path: string;
  children: TreeItem[];
};
type TreeItem = TreeFileNode | TreeFolderNode;

function buildFileTree(files: FileEntry[]): TreeItem[] {
  const root: TreeFolderNode = { type: "folder", name: "", path: "", children: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === undefined) continue;
      const folderPath = parts.slice(0, i + 1).join("/");
      let folder = current.children.find(
        (c): c is TreeFolderNode => c.type === "folder" && c.name === part
      );
      if (!folder) {
        folder = { type: "folder", name: part, path: folderPath, children: [] };
        current.children.push(folder);
      }
      current = folder;
    }
    current.children.push({
      type: "file",
      name: parts.at(-1) ?? file.path,
      path: file.path,
      file,
    });
  }
  const sort = (items: TreeItem[]): TreeItem[] => {
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const item of items) {
      if (item.type === "folder") sort(item.children);
    }
    return items;
  };
  return sort(root.children);
}

function collectFolderPaths(items: TreeItem[], acc: string[] = []): string[] {
  for (const item of items) {
    if (item.type === "folder") {
      acc.push(item.path);
      collectFolderPaths(item.children, acc);
    }
  }
  return acc;
}

function nextParentPath(level: number, parentPath: boolean[], isLast: boolean): boolean[] {
  if (level === 0) return [];
  const next = [...parentPath];
  while (next.length < level) next.push(false);
  next[level - 1] = isLast;
  return next;
}

function CommitDiffHeader({
  commit,
  fileCount,
  onToggleViewMode,
  onToggleWrap,
  resolvedTheme,
  setThemeKey,
  themeKey,
  viewMode,
  wrapEnabled,
}: {
  commit: Commit;
  fileCount: number | null;
  onToggleViewMode: () => void;
  onToggleWrap: () => void;
  resolvedTheme: string;
  setThemeKey: (key: string) => void;
  themeKey: string;
  viewMode: "split" | "unified";
  wrapEnabled: boolean;
}) {
  const isSplit = viewMode === "split";

  return (
    <ResponsiveDialogHeader className="space-y-1 border-b pt-2 pr-10 pb-2 pl-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <ResponsiveDialogTitle className="truncate text-sm">
            {commit.subject}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
            <span>{commit.shortSha}</span>
            <span aria-hidden>·</span>
            <span>{COMMIT_DATE_FORMAT.format(new Date(commit.authorDate))}</span>
            {fileCount === null ? null : (
              <>
                <span aria-hidden>·</span>
                <span>
                  {fileCount} file{fileCount === 1 ? "" : "s"}
                </span>
              </>
            )}
          </ResponsiveDialogDescription>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleViewMode}
                  aria-pressed={isSplit}
                  aria-label={isSplit ? "Switch to unified view" : "Switch to split view"}
                >
                  {isSplit ? <Columns2 /> : <Rows2 />}
                </Button>
              }
            />
            <TooltipContent>{isSplit ? "Split view" : "Unified view"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleWrap}
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
          <CmThemePicker themeKey={themeKey} onChange={setThemeKey} resolvedTheme={resolvedTheme} />
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
  );
}

type CachedFileList = NonNullable<
  ReturnType<typeof useQuery<typeof api.commits.getCachedFileList>>
>;

function FileListPane({
  commitSha,
  effectivePath,
  files,
  listError,
  onSelect,
}: {
  commitSha: string;
  effectivePath: string | null;
  files: FileEntry[] | null;
  listError: string | null;
  onSelect: (path: string) => void;
}) {
  if (listError) {
    return <p className="px-3 py-4 text-destructive text-xs">{listError}</p>;
  }
  if (!files) {
    return <FileListSkeleton />;
  }
  if (files.length === 0) {
    return <p className="px-3 py-4 text-muted-foreground text-xs">No file changes.</p>;
  }
  return (
    <FileTreeSidebar
      commitSha={commitSha}
      effectivePath={effectivePath}
      files={files}
      onSelect={onSelect}
    />
  );
}

function SelectedFileBar({ file }: { file: FileEntry }) {
  const renamed = file.prevPath && file.prevPath !== file.path;

  return (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 font-mono text-muted-foreground text-xs">
      <span className={cn(STATUS_COLOR[file.status] ?? "text-muted-foreground")}>
        {file.status}
      </span>
      <span className="truncate" title={file.path}>
        {renamed ? `${file.prevPath} → ${file.path}` : file.path}
      </span>
    </div>
  );
}

function DiffPane({
  cmTheme,
  commitSha,
  fileList,
  selectedFile,
  viewMode,
  wrapEnabled,
}: {
  cmTheme: Extension;
  commitSha: string;
  fileList: CachedFileList | null;
  selectedFile: FileEntry | null;
  viewMode: "split" | "unified";
  wrapEnabled: boolean;
}) {
  if (!(selectedFile && fileList)) {
    return (
      <p className="px-4 py-8 text-center text-muted-foreground text-sm">
        {fileList ? "Select a file" : "Loading…"}
      </p>
    );
  }
  return (
    <FileDiff
      key={`${commitSha}:${selectedFile.path}`}
      commitSha={commitSha}
      file={selectedFile}
      parentSha={fileList.parentSha}
      cmTheme={cmTheme}
      viewMode={viewMode}
      wrapEnabled={wrapEnabled}
    />
  );
}

export function CommitDiffBody({ commit }: { commit: Commit }) {
  const fetchCommitFiles = useAction(api.commits.fetchCommitFiles);
  const { resolvedTheme } = useTheme();
  const [themeKey, setThemeKey] = useLocalStorage<string>(
    "commit-diff-theme",
    DEFAULT_THEME_KEY,
    EMPTY_STORAGE_OPTIONS
  );
  const [wrapEnabled, setWrapEnabled] = useLocalStorage<boolean>(
    "commit-diff-wrap",
    false,
    EMPTY_STORAGE_OPTIONS
  );
  const [viewMode, setViewMode] = useLocalStorage<"split" | "unified">(
    "commit-diff-view-mode",
    "split",
    EMPTY_STORAGE_OPTIONS
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const handleToggleViewMode = useCallback(
    () => setViewMode(viewMode === "split" ? "unified" : "split"),
    [setViewMode, viewMode]
  );
  const handleToggleWrap = useCallback(
    () => setWrapEnabled(!wrapEnabled),
    [setWrapEnabled, wrapEnabled]
  );

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
      <CommitDiffHeader
        commit={commit}
        fileCount={fileList?.files.length ?? null}
        onToggleViewMode={handleToggleViewMode}
        onToggleWrap={handleToggleWrap}
        resolvedTheme={resolvedTheme}
        setThemeKey={setThemeKey}
        themeKey={themeKey}
        viewMode={viewMode}
        wrapEnabled={wrapEnabled}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-[40vh] shrink-0 flex-col overflow-hidden border-b md:max-h-none md:w-64 md:border-r md:border-b-0 lg:w-72">
          <FileListPane
            commitSha={commit.sha}
            effectivePath={effectivePath}
            files={fileList?.files ?? null}
            listError={listError}
            onSelect={setSelectedPath}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {selectedFile ? <SelectedFileBar file={selectedFile} /> : null}
          <div className="min-h-0 min-w-0 flex-1 overflow-auto">
            <DiffPane
              cmTheme={cmTheme}
              commitSha={commit.sha}
              fileList={fileList ?? null}
              selectedFile={selectedFile}
              viewMode={viewMode}
              wrapEnabled={wrapEnabled}
            />
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
    fetchFileBlobs({ sha: commitSha, path: file.path }).catch((e: unknown) => {
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

function FileTreeSidebar({
  commitSha,
  files,
  effectivePath,
  onSelect,
}: {
  commitSha: string;
  files: FileEntry[];
  effectivePath: string | null;
  onSelect: (path: string) => void;
}) {
  const [filterQuery, setFilterQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useDebounceValue("", 500);

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilterQuery(value);
      setDebouncedQuery(value);
      if (value === "") setDebouncedQuery.flush();
    },
    [setDebouncedQuery]
  );
  const onClear = useCallback(() => {
    setFilterQuery("");
    setDebouncedQuery("");
    setDebouncedQuery.flush();
  }, [setDebouncedQuery]);

  const trimmedQuery = debouncedQuery.trim().toLowerCase();
  const filteredFiles = useMemo(() => {
    if (!trimmedQuery) return files;
    return files.filter((f) => f.path.toLowerCase().includes(trimmedQuery));
  }, [files, trimmedQuery]);
  const fileTree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);
  const defaultExpandedIds = useMemo(() => collectFolderPaths(fileTree), [fileTree]);

  return (
    <>
      <div className="shrink-0 border-b p-2">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Filter files"
            onChange={onFilterChange}
            placeholder="Filter files…"
            value={filterQuery}
          />
          {filterQuery ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Clear filter" onClick={onClear} size="icon-xs">
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <p className="px-3 py-4 text-muted-foreground text-xs">
            No files match “{debouncedQuery}”.
          </p>
        ) : (
          <TreeProvider
            key={`${commitSha}:${trimmedQuery}`}
            defaultExpandedIds={defaultExpandedIds}
            indent={14}
            selectable={false}
            showLines
          >
            <TreeView className="p-2">
              <FileTreeNodes
                effectivePath={effectivePath}
                items={fileTree}
                level={0}
                onSelect={onSelect}
                parentPath={[]}
              />
            </TreeView>
          </TreeProvider>
        )}
      </div>
    </>
  );
}

function FileTreeNodes({
  items,
  level,
  parentPath,
  effectivePath,
  onSelect,
}: {
  items: TreeItem[];
  level: number;
  parentPath: boolean[];
  effectivePath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <>
      {items.map((item, idx) => (
        <FileTreeNode
          key={item.path}
          item={item}
          isLast={idx === items.length - 1}
          level={level}
          parentPath={parentPath}
          effectivePath={effectivePath}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

function FileTreeNode({
  item,
  isLast,
  level,
  parentPath,
  effectivePath,
  onSelect,
}: {
  item: TreeItem;
  isLast: boolean;
  level: number;
  parentPath: boolean[];
  effectivePath: string | null;
  onSelect: (path: string) => void;
}) {
  const isSelected = item.type === "file" && item.path === effectivePath;
  const hasChildren = item.type === "folder";

  const handleClick = useCallback(() => {
    if (item.type === "file") onSelect(item.path);
  }, [item, onSelect]);

  return (
    <TreeNode
      key={item.path}
      isLast={isLast}
      level={level}
      nodeId={item.path}
      parentPath={parentPath}
    >
      <TreeNodeTrigger
        className={cn("py-1", isSelected && "bg-muted text-foreground hover:bg-muted")}
        onClick={handleClick}
        title={item.path}
      >
        <TreeExpander hasChildren={hasChildren} />
        {item.type === "file" ? (
          <FileIcon
            aria-hidden
            className={cn(
              "mr-2 size-3.5 shrink-0",
              STATUS_COLOR[item.file.status] ?? "text-muted-foreground"
            )}
          />
        ) : (
          <TreeIcon hasChildren />
        )}
        <TreeLabel className="font-mono text-xs">{item.name}</TreeLabel>
        {item.type === "file" ? (
          <span className="ml-2 hidden shrink-0 font-mono text-[10px] text-muted-foreground md:inline">
            <span className="text-emerald-600 dark:text-emerald-400">+{item.file.additions}</span>{" "}
            <span className="text-red-600 dark:text-red-400">-{item.file.deletions}</span>
          </span>
        ) : null}
      </TreeNodeTrigger>
      {item.type === "folder" ? (
        <TreeNodeContent hasChildren>
          <FileTreeNodes
            effectivePath={effectivePath}
            items={item.children}
            level={level + 1}
            onSelect={onSelect}
            parentPath={nextParentPath(level, parentPath, isLast)}
          />
        </TreeNodeContent>
      ) : null}
    </TreeNode>
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

function CmThemeItem({
  theme,
  checked,
  onSelect,
}: {
  theme: (typeof THEMES)[number];
  checked: boolean;
  onSelect: (key: (typeof THEMES)[number]["key"]) => void;
}) {
  const handleSelect = useCallback(() => onSelect(theme.key), [onSelect, theme.key]);

  return (
    <CommandItem value={theme.label} data-checked={checked} onSelect={handleSelect}>
      <ThemePalette theme={theme} />
      {theme.label}
    </CommandItem>
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
                <CmThemeItem
                  key={t.key}
                  theme={t}
                  checked={themeKey === t.key}
                  onSelect={onChange}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
