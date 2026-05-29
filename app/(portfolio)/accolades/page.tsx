import PageHeader from "@/components/new-site/content/page-header";
import AccoladesTabs from "@/components/new-site/data-display/accolades-tabs";

export const metadata = {
  title: "Accolades",
  description: "Certificates, academic achievements, recognitions, and kind words.",
};

export default function AccoladesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Accolades"
        description="Certificates, academic achievements, recognitions, and kind words."
      />
      <AccoladesTabs />
    </div>
  );
}
