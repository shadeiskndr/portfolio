import PageHeader from "@/components/new-site/content/page-header";
import ExperienceCards from "@/components/new-site/data-display/experience-cards";

export const metadata = {
  title: "Experience",
  description: "A quick summary of my work experience.",
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Experience" description="A quick summary of my work experience." />
      <ExperienceCards />
    </div>
  );
}
