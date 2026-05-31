import PageHeader from "@/components/new-site/content/page-header";
import UsesTabs from "@/components/new-site/data-display/uses-tabs";

export const metadata = { title: "Uses" };

export default function UsesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Uses" description="Hardware, software, and setup notes." />
      <UsesTabs />
    </div>
  );
}
