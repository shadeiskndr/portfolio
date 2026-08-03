import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/new-site/content/mdx-components";
import { PostHeader } from "@/components/new-site/content/post-header";
import { JsonLd } from "@/components/new-site/json-ld";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { getAllSlugs, getPostBySlug } from "@/lib/new-site/mdx";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("til");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("til", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/til/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url: `/til/${slug}`,
      publishedTime: post.date,
      authors: [SITE_NAME],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function TilPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("til", slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          url: `${SITE_URL}/til/${slug}`,
          ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
          author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "TIL", item: `${SITE_URL}/til` },
            { "@type": "ListItem", position: 3, name: post.title },
          ],
        }}
      />
      <PostHeader date={post.date} title={post.title} summary={post.summary} />
      <BlurFade delay={0.27}>
        <div className="prose-content">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypePrettyCode,
                    {
                      theme: { light: "github-light", dark: "github-dark" },
                      keepBackground: false,
                    },
                  ],
                ],
              },
            }}
          />
        </div>
      </BlurFade>
    </article>
  );
}
