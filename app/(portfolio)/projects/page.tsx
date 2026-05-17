import PageHeader from "@/components/new-site/content/page-header";
import ProjectsSpotlight from "@/components/new-site/data-display/projects-spotlight";
import { GithubCalendar } from "@/components/ui/componentry/github-calendar";

export const metadata = {
  title: "Projects",
  description: "Things I've built, finished or otherwise.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" description="Things I've built, finished or otherwise." />
      <div className="hide-scrollbar mb-10 overflow-x-auto">
        <GithubCalendar username="shadeiskndr" shape="rounded" colorSchema="green" />
      </div>
      <ProjectsSpotlight />
    </div>
  );
}
