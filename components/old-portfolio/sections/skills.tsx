import Tag from "@/components/old-portfolio/data-display/tag";
import TechDetails from "@/components/old-portfolio/data-display/tech-details";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import { BACKEND, CLOUDDEVOPS, DATABASES, FRONTEND, LANGUAGES } from "@/lib/data";

const SkillsSection = () => {
  return (
    <Container id="skills">
      <div className="flex flex-col items-center gap-4">
        <div className="self-center">
          <Tag label="Technical Skills" />
        </div>
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Programming Languages:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-8 lg:grid-cols-8 lg:gap-y-12">
        {LANGUAGES.map((technology, index) => (
          <TechDetails {...technology} key={index} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Frontend:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-8 lg:grid-cols-8 lg:gap-y-12">
        {FRONTEND.map((technology, index) => (
          <TechDetails {...technology} key={index} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Backend:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-8 lg:grid-cols-8 lg:gap-y-12">
        {BACKEND.map((technology, index) => (
          <TechDetails {...technology} key={index} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Databases:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-8 lg:grid-cols-8 lg:gap-y-12">
        {DATABASES.map((technology, index) => (
          <TechDetails {...technology} key={index} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Developer Tools:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-8 lg:grid-cols-8 lg:gap-y-12">
        {CLOUDDEVOPS.map((technology, index) => (
          <TechDetails {...technology} key={index} />
        ))}
      </div>
    </Container>
  );
};

export default SkillsSection;
