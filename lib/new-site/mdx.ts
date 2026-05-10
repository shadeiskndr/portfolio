import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostCategory = "thoughts" | "til" | "readings";

export type PostFrontmatter = {
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  category: PostCategory;
};

export type Post = PostMeta & {
  content: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

async function readMdxFile(category: PostCategory, slug: string): Promise<Post | null> {
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
  const dir = path.join(CONTENT_DIR, category);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    entries
      .filter((name) => name.endsWith(".mdx"))
      .map(async (name) => readMdxFile(category, name.replace(/\.mdx$/, "")))
  );

  return posts
    .filter((p): p is Post => p !== null)
    .filter((p) => (process.env.NODE_ENV === "production" ? !p.draft : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content: _content, ...meta }) => meta);
}

export async function getPostBySlug(category: PostCategory, slug: string): Promise<Post | null> {
  return readMdxFile(category, slug);
}

export async function getAllSlugs(category: PostCategory): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, category);
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((n) => n.endsWith(".mdx")).map((n) => n.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}
