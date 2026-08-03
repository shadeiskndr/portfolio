"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAsset } from "@/lib/assets-context";

const DownloadCV = () => {
  const resume = useAsset("resume");
  const handleDownload = useCallback(() => {
    if (resume) window.open(resume.url, "_blank", "noopener");
  }, [resume]);

  return (
    <Button className="text-primary-foreground" disabled={!resume} onClick={handleDownload}>
      Download CV
    </Button>
  );
};

export default DownloadCV;
