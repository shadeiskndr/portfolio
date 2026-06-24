"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PostList from "@/components/new-site/content/post-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostMeta } from "@/lib/new-site/mdx";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;
const VISIBLE_TAGS = 12;

export default function TilIndex({ posts, basePath }: { posts: PostMeta[]; basePath: string }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [page, setPage] = useState(1);
  const [showAllTags, setShowAllTags] = useState(false);

  const facets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      for (const tag of p.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
      (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
    );
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag !== "all" && !(p.tags ?? []).includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.summary?.toLowerCase().includes(q) ?? false) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, search, activeTag]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagePosts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Any filter change resets to the first page — done in the handlers, so no
  // effect is needed to keep `page` in range.
  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const onTag = (tag: string) => {
    setActiveTag(tag);
    setPage(1);
  };

  // Keep the chip row calm by default: show the most-used tags, collapse the
  // long tail behind a toggle. The active tag is always kept visible.
  const moreCount = Math.max(0, facets.length - VISIBLE_TAGS);
  const visibleFacets = useMemo(() => {
    if (showAllTags || facets.length <= VISIBLE_TAGS) return facets;
    const top = facets.slice(0, VISIBLE_TAGS);
    if (activeTag !== "all" && !top.some((f) => f.tag === activeTag)) {
      const active = facets.find((f) => f.tag === activeTag);
      if (active) return [...top, active];
    }
    return top;
  }, [facets, showAllTags, activeTag]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="h-9 pl-8"
        />
      </div>

      {facets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <TagChip label="All" active={activeTag === "all"} onClick={() => onTag("all")} />
          {visibleFacets.map(({ tag, count }) => (
            <TagChip
              key={tag}
              label={tag}
              count={count}
              active={activeTag === tag}
              onClick={() => onTag(activeTag === tag ? "all" : tag)}
            />
          ))}
          {moreCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAllTags((v) => !v)}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              {showAllTags ? "Show less" : `+${moreCount} more`}
            </button>
          ) : null}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <p className="text-muted-foreground text-xs">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          {activeTag !== "all" ? (
            <>
              {" tagged "}
              <span className="text-foreground">{activeTag}</span>
            </>
          ) : null}
        </p>
      ) : null}

      <PostList
        posts={pagePosts}
        basePath={basePath}
        emptyMessage="Nothing matches those filters."
      />

      {pageCount > 1 ? <Pager page={safePage} pageCount={pageCount} onPage={setPage} /> : null}
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "text-[11px] tabular-nums",
            active ? "text-primary-foreground/70" : "text-muted-foreground/60"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

type PageItem = { kind: "page"; value: number } | { kind: "gap"; id: string };

// Compact page list: everything up to 7 pages, otherwise first/last, the
// current page, and its neighbors, with gaps collapsed to an ellipsis.
function pageItems(current: number, total: number): PageItem[] {
  const nums =
    total <= 7
      ? Array.from({ length: total }, (_, i) => i + 1)
      : [...new Set([1, total, current, current - 1, current + 1])]
          .filter((p) => p >= 1 && p <= total)
          .sort((a, b) => a - b);
  const out: PageItem[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push({ kind: "gap", id: `gap-${prev}-${n}` });
    out.push({ kind: "page", value: n });
    prev = n;
  }
  return out;
}

function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  return (
    <nav aria-label="pagination" className="flex items-center justify-center gap-1 pt-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pageItems(page, pageCount).map((item) =>
        item.kind === "gap" ? (
          <span key={item.id} className="px-1 text-muted-foreground text-sm" aria-hidden>
            …
          </span>
        ) : (
          <Button
            key={item.value}
            variant={item.value === page ? "outline" : "ghost"}
            size="icon-sm"
            aria-current={item.value === page ? "page" : undefined}
            aria-label={`Page ${item.value}`}
            onClick={() => onPage(item.value)}
          >
            {item.value}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
