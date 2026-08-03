import CertificateDetails from "@/components/old-portfolio/data-display/certificate-details";
import Tag from "@/components/old-portfolio/data-display/tag";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import { CERTIFICATES } from "@/lib/data";

const CertificatesSection = () => {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable page-section landmark; NAV_LINKS in lib/data.tsx anchors to this exact id
    <Container id="certificates" className="">
      <div className="flex flex-col items-center gap-4">
        <div className="self-center">
          <Tag label="Certificates" />
        </div>
        <Typography variant="subtitle" className="max-w-xl text-center">
          Certificates to show my commitment for lifelong learning:
        </Typography>
      </div>

      <div className="flex gap-12 max-md:flex-col md:max-lg:flex-wrap">
        {CERTIFICATES?.map((certificate) => (
          <CertificateDetails key={certificate.certificateName} {...certificate} />
        ))}
      </div>
    </Container>
  );
};

export default CertificatesSection;
