import PageHeader from "@/components/new-site/content/page-header";
import PostList from "@/components/new-site/content/post-list";
import { getAllPosts } from "@/lib/new-site/mdx";

export const metadata = {
  title: "TIL",
  description: "Today I learned — short notes on things picked up along the way.",
};

export default async function TilPage() {
  const posts = await getAllPosts("til");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="TIL"
        description="Today I learned — short notes on things picked up along the way."
      />
      <PostList posts={posts} basePath="/til" />
    </div>
  );
}
