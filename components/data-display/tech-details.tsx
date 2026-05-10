"use client";

import ImageWrapper from "@/components/data-display/image-wrapper";
import Typography from "@/components/general/typography";
import Link from "@/components/navigation/link";
import type { TechDetails as TechDetailsType } from "@/lib/types";

const TechDetails = ({ url, logo, darkModeLogo, label }: TechDetailsType) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link noCustomization href={url} externalLink>
        <ImageWrapper
          src={logo}
          srcForDarkMode={darkModeLogo}
          alt={label}
          className="transition-transform duration-300 md:hover:scale-110"
        />
      </Link>
      <Typography variant="body1">{label}</Typography>
    </div>
  );
};

export default TechDetails;
