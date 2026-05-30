"use client";

import { Button } from "@/components/ui/button";
import { useAsset } from "@/lib/assets-provider";

const DownloadCV = () => {
  const resume = useAsset("resume");
  return (
    <Button
      className="text-primary-foreground"
      disabled={!resume}
      onClick={() => resume && window?.open(resume.url, "_blank")}
    >
      Download CV
    </Button>
  );
};

export default DownloadCV;
