import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/new-site/mdx";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/accolades",
  "/bookmarks",
  "/changelog",
  "/chat",
  "/experience",
  "/networks",
  "/photography",
  "/projects",
  "/songs",
  "/thoughts",
  "/til",
  "/uses",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [thoughts, til] = await Promise.all([getAllPosts("thoughts"), getAllPosts("til")]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "weekly" as const,
    })),
    ...thoughts.map((post) => ({
      url: `${SITE_URL}/thoughts/${post.slug}`,
      lastModified: new Date(post.date),
    })),
    ...til.map((post) => ({
      url: `${SITE_URL}/til/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
