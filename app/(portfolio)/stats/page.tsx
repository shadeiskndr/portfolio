import PageHeader from "@/components/new-site/content/page-header";
import CodestatsBoard from "@/components/new-site/data-display/codestats-board";

export const metadata = {
  title: "Stats",
  description:
    "Coding XP tracked by Code::Stats — levels, languages, machines, and daily activity.",
};

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Stats"
        description="Every keystroke I type in an editor earns XP on Code::Stats. Here's what that adds up to."
      />
      <CodestatsBoard />
    </div>
  );
}
