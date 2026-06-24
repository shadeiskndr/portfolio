import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/new-site/content/mdx-components";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { getAllSlugs, getPostBySlug } from "@/lib/new-site/mdx";

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
  };
}

export default async function TilPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("til", slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl">
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
                      // Dual themes emit CSS vars (--shiki-light/--shiki-dark) per
                      // token; globals.css swaps them on the .dark class. Drop
                      // Shiki's own background so the <pre> bg-muted shows through.
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
