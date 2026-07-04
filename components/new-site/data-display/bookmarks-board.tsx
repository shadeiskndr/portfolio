"use client";

import { useQuery } from "convex/react";
import { ArrowUpRight, Globe, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { ResolvedBookmark } from "@/convex/bookmarks";
import { cn } from "@/lib/utils";

type Section = "reading" | "resource";

const TAB_META: { value: Section; label: string }[] = [
  { value: "reading", label: "Readings" },
  { value: "resource", label: "Resources" },
];

// Hoisted to module scope with an explicit locale + timeZone so the server and
// browser render identical text (no hydration mismatch from ambient settings).
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(ts: number) {
  return dateFormatter.format(new Date(ts));
}

export default function BookmarksBoard() {
  const readings = useQuery(api.bookmarks.list, { section: "reading" });
  const resources = useQuery(api.bookmarks.list, { section: "resource" });

  const countFor = (section: Section) =>
    section === "reading" ? readings?.length : resources?.length;

  return (
    <Tabs defaultValue="reading" className="gap-6">
      <TabsList className="h-9">
        {TAB_META.map((t) => {
          const count = countFor(t.value);
          return (
            <TabsTrigger key={t.value} value={t.value} className="px-3">
              {t.label}
              {count !== undefined ? (
                <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="reading">
        <BookmarkSection bookmarks={readings} variant="reading" />
      </TabsContent>
      <TabsContent value="resource">
        <BookmarkSection bookmarks={resources} variant="resource" />
      </TabsContent>
    </Tabs>
  );
}

function BookmarkSection({
  bookmarks,
  variant,
}: {
  bookmarks: ResolvedBookmark[] | undefined;
  variant: Section;
}) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const facets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookmarks ?? []) {
      for (const tag of b.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
      (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
    );
  }, [bookmarks]);

  const filtered = useMemo(() => {
    if (!bookmarks) return [];
    const q = search.trim().toLowerCase();
    return bookmarks.filter((b) => {
      if (activeTag !== "all" && !b.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.domain.toLowerCase().includes(q) ||
        (b.description?.toLowerCase().includes(q) ?? false) ||
        b.tags.some((t) => t.includes(q))
      );
    });
  }, [bookmarks, search, activeTag]);

  const isLoading = bookmarks === undefined;

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={variant === "reading" ? "Search readings..." : "Search resources..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8"
        />
      </div>

      {facets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <TagChip label="All" active={activeTag === "all"} onClick={() => setActiveTag("all")} />
          {facets.map(({ tag, count }) => (
            <TagChip
              key={tag}
              label={tag}
              count={count}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            />
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <BoardSkeleton />
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground text-sm">
          {search.trim() || activeTag !== "all"
            ? "Nothing matches those filters."
            : "No bookmarks yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BookmarkCard key={b.url} bookmark={b} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "font-medium tabular-nums",
            active ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function BookmarkCard({ bookmark, variant }: { bookmark: ResolvedBookmark; variant: Section }) {
  const { url, title, domain, tags, previewUrl, faviconUrl, publishedAt } = bookmark;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      title={bookmark.description ?? title}
      className="group flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/25 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
    >
      <div className="relative aspect-16/10 overflow-hidden border-b bg-muted">
        {previewUrl ? (
          <Image
            alt=""
            src={previewUrl}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 92vw"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <PreviewFallback domain={domain} faviconUrl={faviconUrl} />
        )}
        <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm ring-1 ring-border backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <ArrowUpRight className="size-3.5" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Favicon faviconUrl={faviconUrl} />
          <span className="truncate">{domain}</span>
          {variant === "reading" && publishedAt ? (
            <>
              <span aria-hidden className="text-muted-foreground/40">
                •
              </span>
              <span className="shrink-0 whitespace-nowrap">{formatDate(publishedAt)}</span>
            </>
          ) : null}
        </div>

        <h3 className="line-clamp-2 font-medium text-sm leading-snug transition-colors group-hover:text-foreground">
          {title}
        </h3>

        {tags.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </a>
  );
}

function Favicon({ faviconUrl }: { faviconUrl: string | null }) {
  if (faviconUrl) {
    return <img alt="" src={faviconUrl} className="size-3.5 shrink-0 rounded-sm" />;
  }
  return <Globe className="size-3.5 shrink-0 opacity-60" aria-hidden />;
}

function PreviewFallback({ domain, faviconUrl }: { domain: string; faviconUrl: string | null }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-muted to-muted/40">
      {faviconUrl ? (
        <img alt="" src={faviconUrl} className="size-8 rounded-md" />
      ) : (
        <span className="font-semibold font-serif text-3xl text-muted-foreground/70">
          {domain.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-muted-foreground/70 text-xs">{domain}</span>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
