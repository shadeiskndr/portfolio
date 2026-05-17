import PageHeader from "@/components/new-site/content/page-header";
import ChangelogList from "@/components/new-site/data-display/changelog-list";

export const metadata = {
  title: "Changelogs",
  description:
    "A running log of every meaningful change made to this site — pulled straight from git history.",
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Changelogs"
        description="A running log of every meaningful change made to this site — pulled straight from git history."
      />
      <ChangelogList />
    </div>
  );
}
