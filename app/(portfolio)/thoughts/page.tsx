import PageHeader from "@/components/new-site/content/page-header";
import PostList from "@/components/new-site/content/post-list";
import { getAllPosts } from "@/lib/new-site/mdx";

export const metadata = {
  title: "Thoughts",
  description: "Essays and longer-form writing.",
};

export default async function ThoughtsPage() {
  const posts = await getAllPosts("thoughts");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Thoughts" description="Essays and longer-form writing." />
      <PostList posts={posts} basePath="/thoughts" />
    </div>
  );
}
