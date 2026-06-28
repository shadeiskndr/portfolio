import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/new-site/content/mdx-components";
import { JsonLd } from "@/components/new-site/json-ld";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { Signature } from "@/components/ui/signature";
import { getAllSlugs, getPostBySlug } from "@/lib/new-site/mdx";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("thoughts");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("thoughts", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/thoughts/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url: `/thoughts/${slug}`,
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

export default async function ThoughtPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("thoughts", slug);
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
          url: `${SITE_URL}/thoughts/${slug}`,
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
            { "@type": "ListItem", position: 2, name: "Thoughts", item: `${SITE_URL}/thoughts` },
            { "@type": "ListItem", position: 3, name: post.title },
          ],
        }}
      />
      <header className="mb-8 space-y-2">
        <BlurFade delay={0}>
          <time className="text-muted-foreground text-sm">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </BlurFade>
        <BlurFade delay={0.09}>
          <h1 className="font-semibold font-serif text-3xl tracking-tight md:text-4xl">
            {post.title}
          </h1>
        </BlurFade>
        {post.summary ? (
          <BlurFade delay={0.18}>
            <p className="text-muted-foreground">{post.summary}</p>
          </BlurFade>
        ) : null}
      </header>
      <BlurFade delay={0.2}>
        <div className="prose-content">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug],
              },
            }}
          />
        </div>
      </BlurFade>
      <BlurFade delay={0.3}>
        <Signature text="shahathir" fontSize={14} className="mt-10 text-foreground/70" inView />
      </BlurFade>
    </article>
  );
}
