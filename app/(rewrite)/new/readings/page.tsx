import PageHeader from "@/components/new-site/content/page-header";
import PostList from "@/components/new-site/content/post-list";
import { getAllPosts } from "@/lib/new-site/mdx";

export const metadata = {
  title: "Readings",
  description: "Books, papers, and articles I'm working through.",
};

export default async function ReadingsPage() {
  const posts = await getAllPosts("readings");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Readings" description="Books, papers, and articles I'm working through." />
      <PostList posts={posts} basePath="/new/readings" />
    </div>
  );
}
