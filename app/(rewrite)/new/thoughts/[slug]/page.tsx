import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/new-site/content/mdx-components";
import { getAllSlugs, getPostBySlug } from "@/lib/new-site/mdx";

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
  };
}

export default async function ThoughtPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("thoughts", slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-8 space-y-2">
        <time className="text-muted-foreground text-sm">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1
          className="font-semibold text-3xl tracking-tight md:text-4xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {post.title}
        </h1>
        {post.summary ? <p className="text-muted-foreground">{post.summary}</p> : null}
      </header>
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
    </article>
  );
}
