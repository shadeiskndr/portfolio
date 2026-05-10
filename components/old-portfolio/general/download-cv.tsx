"use client";

import { Button } from "@/components/ui/button";

const DownloadCV = () => {
  return (
    <Button
      className="text-primary-foreground"
      onClick={() => window?.open("/files/Resume_ShahathirIskandar.pdf", "_blank")}
    >
      Download CV
    </Button>
  );
};

export default DownloadCV;
