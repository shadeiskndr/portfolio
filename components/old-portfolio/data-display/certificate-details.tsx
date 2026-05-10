import Image from "next/image";
import Typography from "@/components/old-portfolio/general/typography";
import Card from "@/components/old-portfolio/layout/card";
import Link from "@/components/old-portfolio/navigation/link";
import type { CertificateDetails as CertificateDetailsProps } from "@/lib/types";

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
        <Typography variant="body1" className="w-full text-center font-semibold text-foreground">
          {certificateName}
        </Typography>
        <Typography variant="body3" className="w-full text-center text-muted-foreground">
          {certificateSource}
        </Typography>
      </div>
      {/*<Typography>&quot;{certificateDescription}&quot;</Typography>*/}
    </Card>
  );
};

export default CertificateDetails;
