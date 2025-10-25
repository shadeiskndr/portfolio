import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { ProjectDetails as ProjectDetailsType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Typography from "@/components/general/typography";
import Link from "@/components/navigation/link";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/layout/card";

type ProjectDetailsProps = ProjectDetailsType & {
  layoutType: "default" | "reverse";
};

const ProjectDetails = ({
  name,
  description,
  technologies,
  url,
  previewImage,
  gifUrl, // Add this line
  layoutType = "default",
}: ProjectDetailsProps) => {
  return (
    <Card className="mx-auto flex w-full max-w-6xl flex-col md:flex-row">
      {/* Image */}
      <div
        className={cn(
          "bg-card flex items-center justify-center border p-8 max-md:rounded-t-xl md:w-1/2 lg:p-12",
          layoutType === "default"
            ? "md:rounded-l-xl md:border-r"
            : "md:order-last md:rounded-r-xl md:border-l"
        )}
      >
        <Link noCustomization href={url} externalLink>
          {gifUrl ? (
            <img
              src={gifUrl}
              alt={`${name} preview`}
              className="rounded-xl shadow-lg transition-transform duration-500 md:hover:scale-105"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Image
              src={previewImage}
              alt={`${name} preview`}
              className="rounded-xl shadow-lg transition-transform duration-500 md:hover:scale-105"
              style={{ objectFit: "cover" }}
            />
          )}
        </Link>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-6 border p-8 max-md:rounded-b-xl max-md:border max-md:border-t-0 md:w-1/2 lg:p-12",
          layoutType === "default"
            ? "border-l-0 md:rounded-r-xl"
            : "md:order-first md:rounded-l-xl md:border-r-0"
        )}
      >
        <Typography variant="subtitle" className="text-foreground font-semibold">
          {name}
        </Typography>
        <Typography className="text-foreground">{description}</Typography>
        <div className="flex flex-wrap gap-2">
          {technologies?.map((technology, index) => (
            <Badge key={index} variant={"outline"}>
              {technology}
            </Badge>
          ))}
        </div>
        <Link
          href={url}
          noCustomization
          className="hover:bg-secondary [&_svg]:stroke-muted-foreground hover:[&_svg]:stroke-foreground self-start rounded-lg p-1.5"
          externalLink
        >
          <ExternalLink />
        </Link>
      </div>
    </Card>
  );
};

export default ProjectDetails;
