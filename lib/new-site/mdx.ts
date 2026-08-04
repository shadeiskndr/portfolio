import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";

export type PostCategory = "thoughts" | "til" | "readings";

export type PostFrontmatter = {
  title: string;
  date: string;
  summary?: string | undefined;
  tags?: string[] | undefined;
  draft?: boolean | undefined;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  category: PostCategory;
};

export type Post = PostMeta & {
  content: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

const HIDE_DRAFTS = process.env["NODE_ENV"] === "production";

async function readMdxFile(category: PostCategory, slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("max");
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as PostFrontmatter;
    return {
      slug,
      category,
      title: fm.title,
      date: typeof fm.date === "string" ? fm.date : new Date(fm.date).toISOString(),
      summary: fm.summary,
      tags: fm.tags,
      draft: fm.draft,
      content,
    };
  } catch {
    return null;
  }
}

export async function getAllPosts(category: PostCategory): Promise<PostMeta[]> {
  "use cache";
  cacheLife("max");
  const dir = path.join(CONTENT_DIR, category);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const pending: Promise<Post | null>[] = [];
  for (const name of entries) {
    if (!name.endsWith(".mdx")) continue;
    pending.push(readMdxFile(category, name.replace(/\.mdx$/, "")));
  }

  const metas: PostMeta[] = [];
  for (const post of await Promise.all(pending)) {
    if (post === null || (HIDE_DRAFTS && post.draft)) continue;
    const { content: _content, ...meta } = post;
    metas.push(meta);
  }
  return metas.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(category: PostCategory, slug: string): Promise<Post | null> {
  return await readMdxFile(category, slug);
}

export async function getAllSlugs(category: PostCategory): Promise<string[]> {
  "use cache";
  cacheLife("max");
  const dir = path.join(CONTENT_DIR, category);
  try {
    const entries = await fs.readdir(dir);
    const slugs: string[] = [];
    for (const name of entries) {
      if (name.endsWith(".mdx")) slugs.push(name.replace(/\.mdx$/, ""));
    }
    return slugs;
  } catch {
    return [];
  }
}
