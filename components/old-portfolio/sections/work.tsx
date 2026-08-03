import ProjectDetails from "@/components/old-portfolio/data-display/project-details";
import Tag from "@/components/old-portfolio/data-display/tag";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import { PROJECTS } from "@/lib/data";

const WorkSection = () => {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable page-section landmark; NAV_LINKS in lib/data.tsx anchors to this exact id
    <Container id="projects">
      <div className="flex flex-col items-center gap-4">
        <div className="self-center">
          <Tag label="Projects" />
        </div>
        <Typography variant="subtitle" className="max-w-xl text-center">
          Some of the noteworthy projects I have built:
        </Typography>
      </div>

      {PROJECTS?.map((project, index) => (
        <ProjectDetails
          key={project.name}
          {...project}
          layoutType={index % 2 === 0 ? "default" : "reverse"}
        />
      ))}
    </Container>
  );
};

export default WorkSection;
