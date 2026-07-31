"use client";

import { useCallback } from "react";
import IconButton from "@/components/old-portfolio/general/icon-button";
import { SOCIAL_LINKS } from "@/lib/data";

const SocialIconButton = ({ socialLink }: { socialLink: (typeof SOCIAL_LINKS)[number] }) => {
  const handleClick = useCallback(() => window.open(socialLink.url, "_blank"), [socialLink.url]);

  return (
    <IconButton onClick={handleClick}>
      <socialLink.icon />
    </IconButton>
  );
};

const SocialIcons = () => {
  return (
    <div className="flex gap-1">
      {SOCIAL_LINKS.map((socialLink, index) => (
        <SocialIconButton key={index} socialLink={socialLink} />
      ))}
    </div>
  );
};

export default SocialIcons;
