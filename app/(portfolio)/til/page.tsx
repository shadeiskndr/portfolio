import PageHeader from "@/components/new-site/content/page-header";
import TilIndex from "@/components/new-site/content/til-index";
import { getAllPosts } from "@/lib/new-site/mdx";

export const metadata = {
  title: "Today I Learned",
  description: "Short notes on things picked up along the way.",
};

export default async function TilPage() {
  const posts = await getAllPosts("til");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Today I Learned"
        description="Short notes on things picked up along the way."
      />
      <TilIndex posts={posts} basePath="/til" />
    </div>
  );
}
