import NextLink from "next/link";
import type { PostMeta } from "@/lib/new-site/mdx";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostList({
  posts,
  basePath,
  emptyMessage = "Nothing here yet.",
}: {
  posts: PostMeta[];
  basePath: string;
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ol className="divide-y">
      {posts.map((post) => (
        <li key={post.slug}>
          <NextLink
            href={`${basePath}/${post.slug}`}
            className="group flex flex-col gap-1 py-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2
                className="font-semibold text-lg group-hover:text-primary"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {post.title}
              </h2>
              <time className="shrink-0 text-muted-foreground text-sm">
                {formatDate(post.date)}
              </time>
            </div>
            {post.summary ? (
              <p className="text-muted-foreground text-sm leading-relaxed">{post.summary}</p>
            ) : null}
            {post.tags && post.tags.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </NextLink>
        </li>
      ))}
    </ol>
  );
}
