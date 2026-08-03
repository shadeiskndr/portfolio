"use client";

import { Paperclip } from "lucide-react";
import { useCallback } from "react";
import { AssetImage } from "@/components/asset-image";
import IconButton from "@/components/old-portfolio/general/icon-button";
import Typography from "@/components/old-portfolio/general/typography";
import Card from "@/components/old-portfolio/layout/card";
import { useAsset } from "@/lib/assets-context";
import type { ExperienceDetails as ExperienceDetailsProps } from "@/lib/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  timeZone: "UTC",
});

const ExperienceDetails = ({
  logoKey,
  darkLogoKey,
  logoAlt,
  position,
  currentlyWorkHere,
  startDate,
  endDate,
  summary,
  attachedFileKey,
}: ExperienceDetailsProps) => {
  const attachment = useAsset(attachedFileKey);
  const handleOpenAttachment = useCallback(() => {
    if (attachment) window.open(attachment.url, "_blank", "noopener");
  }, [attachment]);

  return (
    <Card className="relative mx-auto flex w-full max-w-4xl flex-col justify-between gap-4 border p-8 md:flex-row md:gap-8">
      <div className="max-md:order-1 md:w-1/4">
        <AssetImage
          assetKey={logoKey}
          alt={logoAlt}
          sizes="120px"
          className={darkLogoKey ? "max-w-30 dark:hidden" : "max-w-30"}
        />
        {darkLogoKey ? (
          <AssetImage
            assetKey={darkLogoKey}
            alt=""
            aria-hidden
            sizes="120px"
            className="hidden max-w-30 dark:block"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-4 max-md:order-3 md:w-2/4">
        <Typography variant="subtitle" className="font-semibold text-foreground">
          {position}
        </Typography>
        <ul className="flex list-disc flex-col gap-2 md:gap-1">
          {summary?.map((sentence) => (
            <Typography component="li" key={sentence} className="text-foreground">
              {sentence}
            </Typography>
          ))}
        </ul>
      </div>
      <div className="max-md:order-2 md:w-1/4">
        <Typography className="text-muted-foreground md:text-right">
          {DATE_FORMATTER.format(startDate)} -{" "}
          {currentlyWorkHere ? "Present" : endDate ? DATE_FORMATTER.format(endDate) : "NA"}
        </Typography>
      </div>
      {attachment && (
        <IconButton
          className="top absolute right-4 md:right-4 md:bottom-4"
          onClick={handleOpenAttachment}
          size="md"
        >
          <Paperclip />
        </IconButton>
      )}
    </Card>
  );
};

export default ExperienceDetails;
