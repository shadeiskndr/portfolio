/**
 * Renders a section displaying a list of projects.
 *
 * The section includes a title, a description, and a list of project details components.
 * The project details are fetched from the `PROJECTS` data source and are displayed
 * in an alternating layout (default or reverse).
 *
 * @returns {JSX.Element} The rendered work section component.
 */
import { PROJECTS } from '@/lib/data';
import ProjectDetails from '@/components/data-display/project-details';
import Tag from '@/components/data-display/tag';
import Typography from '@/components/general/typography';
import Container from '@/components/layout/container';

const WorkSection = () => {
  return (
    <Container id="projects" className="bg-gray-50">
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
          key={index}
          {...project}
          layoutType={index % 2 === 0 ? 'default' : 'reverse'}
        />
      ))}
    </Container>
  );
};

export default WorkSection;
