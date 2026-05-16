"use client";

import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Commit = Doc<"commits">;

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "feat", label: "Features" },
  { value: "fix", label: "Fixes" },
  { value: "perf", label: "Perf" },
  { value: "security", label: "Security" },
  { value: "refactor", label: "Refactor" },
  { value: "docs", label: "Docs" },
  { value: "style", label: "Style" },
  { value: "chore", label: "Chore" },
  { value: "content", label: "Content" },
];

const TYPE_LABELS: Record<string, string> = {
  feat: "FEAT",
  fix: "FIX",
  perf: "PERF",
  security: "SEC",
  refactor: "REF",
  docs: "DOCS",
  style: "STYLE",
  chore: "CHORE",
  content: "CONTENT",
  other: "OTHER",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  feat: "text-emerald-600 dark:text-emerald-400",
  fix: "text-amber-600 dark:text-amber-400",
  perf: "text-blue-600 dark:text-blue-400",
  security: "text-red-600 dark:text-red-400",
  refactor: "text-purple-600 dark:text-purple-400",
  docs: "text-cyan-600 dark:text-cyan-400",
  style: "text-pink-600 dark:text-pink-400",
  chore: "text-muted-foreground",
  content: "text-teal-600 dark:text-teal-400",
  other: "text-muted-foreground",
};

const INITIAL_PER_MONTH = 5;

function formatMonthKey(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long" }).toUpperCase();
}

function formatRowDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function groupByMonth(commits: Commit[]) {
  const groups: { key: string; commits: Commit[] }[] = [];
  let current: { key: string; commits: Commit[] } | null = null;
  for (const c of commits) {
    const key = formatMonthKey(c.authorDate);
    if (!current || current.key !== key) {
      current = { key, commits: [] };
      groups.push(current);
    }
    current.commits.push(c);
  }
  return groups;
}

export default function ChangelogList() {
  const [type, setType] = useState<string>("all");
  const [hideNoise, setHideNoise] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const isSearching = search.trim().length > 0;

  const counts = useQuery(api.commits.counts);
  const listed = useQuery(
    api.commits.list,
    isSearching ? "skip" : { type, hideNoise, limit: 1000 }
  );
  const searched = useQuery(
    api.commits.search,
    isSearching ? { q: search.trim(), limit: 100 } : "skip"
  );

  const commits = isSearching ? searched : listed;
  const groups = useMemo(() => (commits ? groupByMonth(commits) : []), [commits]);

  const isLoading = commits === undefined;

  return (
    <div className="space-y-6">
      <FilterChips active={type} onChange={setType} counts={counts} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search commits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <label
          htmlFor="changelog-hide-noise"
          className="flex shrink-0 items-center gap-2 text-muted-foreground text-sm"
        >
          Hide noise
          <Switch id="changelog-hide-noise" checked={hideNoise} onCheckedChange={setHideNoise} />
        </label>
      </div>

      {isLoading ? <ListSkeleton /> : null}

      {!isLoading && groups.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground text-sm">
          {isSearching ? "No commits match that search." : "No commits yet."}
        </p>
      ) : null}

      {!isLoading
        ? groups.map((group) => {
            const isExpanded = expanded.has(group.key) || isSearching;
            const initial = group.commits.slice(0, INITIAL_PER_MONTH);
            const extras = group.commits.slice(INITIAL_PER_MONTH);
            const hasExtras = extras.length > 0;
            const toggle = () =>
              setExpanded((prev) => {
                const next = new Set(prev);
                if (next.has(group.key)) next.delete(group.key);
                else next.add(group.key);
                return next;
              });
            return (
              <section key={group.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-muted-foreground text-xs tracking-wider">
                    {group.key}
                  </h2>
                  <Badge variant="secondary" className="px-1.5">
                    {group.commits.length}
                  </Badge>
                </div>
                {/* biome-ignore lint/a11y/useSemanticElements: needs <div> to nest motion.div children for height animation */}
                <div role="list" className="divide-y overflow-hidden rounded-lg border bg-muted/20">
                  {initial.map((commit) => (
                    <CommitRow key={commit.sha} commit={commit} />
                  ))}
                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        key="extras"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y">
                          {extras.map((commit, i) => (
                            <motion.div
                              key={commit.sha}
                              role="listitem"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: Math.min(i * 0.02, 0.25),
                              }}
                            >
                              <CommitRowAnchor commit={commit} />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                {hasExtras && !isSearching ? (
                  <button
                    type="button"
                    onClick={toggle}
                    className="block w-full text-center text-muted-foreground text-xs hover:text-foreground"
                  >
                    {isExpanded ? "Show less" : `Show ${extras.length} more`}
                  </button>
                ) : null}
              </section>
            );
          })
        : null}
    </div>
  );
}

function CommitRow({ commit }: { commit: Commit }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: paired with role="list" parent in ChangelogList
    <div role="listitem">
      <CommitRowAnchor commit={commit} />
    </div>
  );
}

function CommitRowAnchor({ commit }: { commit: Commit }) {
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noreferrer"
      className="group/row relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60 sm:gap-4"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1.5 left-0 w-0.5 origin-center scale-y-0 rounded-r-full bg-foreground/70 transition-transform duration-150 group-hover/row:scale-y-100"
      />
      <span
        className={cn(
          "w-14 shrink-0 font-mono text-[10px] tracking-wider transition-colors sm:w-16",
          TYPE_BADGE_CLASS[commit.type] ?? TYPE_BADGE_CLASS.other
        )}
      >
        {TYPE_LABELS[commit.type] ?? "OTHER"}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm transition-colors group-hover/row:text-foreground">
        {commit.subject}
      </span>
      <span className="hidden shrink-0 text-muted-foreground/80 text-xs transition-colors group-hover/row:text-muted-foreground sm:inline">
        {formatRowDate(commit.authorDate)}
      </span>
      <span className="shrink-0 font-mono text-muted-foreground/70 text-xs transition-colors group-hover/row:text-foreground">
        {commit.shortSha}
      </span>
    </a>
  );
}

function FilterChips({
  active,
  onChange,
  counts,
}: {
  active: string;
  onChange: (value: string) => void;
  counts: { all: number; byType: Record<string, number> } | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TYPE_FILTERS.map((filter) => {
        const count = filter.value === "all" ? counts?.all : counts?.byType[filter.value];
        if (filter.value !== "all" && counts && !count) return null;
        const isActive = active === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {filter.value !== "all" ? (
              <span
                className={cn(
                  "font-medium tabular-nums",
                  isActive ? "text-background" : "text-muted-foreground"
                )}
              >
                {count ?? "—"}
              </span>
            ) : null}
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={`group-${idx}`} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={`row-${idx}-${j}`} className="h-6 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
