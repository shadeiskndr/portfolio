import Image from "next/image";

import { CertificateDetails as CertificateDetailsProps } from "@/lib/types";
import Typography from "@/components/general/typography";
import Card from "@/components/layout/card";
import Link from "@/components/navigation/link";

const CertificateDetails = ({
  certificateName,
  certificateImage,
  certificateSource,
  url,
}: CertificateDetailsProps) => {
  return (
    <Card className="mx-auto flex flex-col items-center gap-6 border p-8 md:w-2/3 md:p-12 lg:w-1/3">
      <Link noCustomization href={url} externalLink>
        <Image
          src={certificateImage!}
          alt={`${certificateName} image`}
          className="rounded-xl shadow-lg transition-transform duration-500 md:hover:scale-105"
        ></Image>
      </Link>
      <div className="flex w-full flex-col gap-1">
        <Typography variant="body1" className="text-foreground w-full text-center font-semibold">
          {certificateName}
        </Typography>
        <Typography variant="body3" className="text-muted-foreground w-full text-center">
          {certificateSource}
        </Typography>
      </div>
      {/*<Typography>&quot;{certificateDescription}&quot;</Typography>*/}
    </Card>
  );
};

export default CertificateDetails;
