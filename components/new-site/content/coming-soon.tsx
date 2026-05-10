import { Construction } from "lucide-react";
import PageHeader from "@/components/new-site/content/page-header";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={title} description={description} />
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-6 text-muted-foreground">
        <Construction className="h-5 w-5" />
        <p className="text-sm">Coming soon. Still building this part.</p>
      </div>
    </div>
  );
}
