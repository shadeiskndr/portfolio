import { AssetImage } from "@/components/asset-image";
import Tag from "@/components/old-portfolio/data-display/tag";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import { TOOLS } from "@/lib/new-site/data";

const SkillsSection = () => {
  return (
    <Container id="skills">
      <div className="flex flex-col items-center gap-4">
        <div className="self-center">
          <Tag label="Technical Skills" />
        </div>
        <Typography variant="subtitleskils" className="max-w-xl text-center">
          Tools &amp; technologies I work with:
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-y-8 md:grid-cols-6 md:gap-y-10 lg:grid-cols-8">
        {TOOLS.map((tool) => (
          <div key={tool.label} className="flex flex-col items-center gap-2">
            <AssetImage
              assetKey={tool.logoKey}
              alt={tool.label}
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              unoptimized
            />
            <span className="text-center text-muted-foreground text-xs">{tool.label}</span>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default SkillsSection;
