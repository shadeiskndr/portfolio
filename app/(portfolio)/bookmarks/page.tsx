import PageHeader from "@/components/new-site/content/page-header";
import BookmarksBoard from "@/components/new-site/data-display/bookmarks-board";

export const metadata = {
  title: "Bookmarks",
  description: "Links worth keeping — articles I've read and resources I keep coming back to.",
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Bookmarks"
        description="Links worth keeping — articles I've read and resources I keep coming back to."
      />
      <BookmarksBoard />
    </div>
  );
}
