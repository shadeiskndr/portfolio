import { CERTIFICATES } from '@/lib/data';
import Tag from '@/components/data-display/tag';
import CertificateDetails from '@/components/data-display/certificate-details';
import Typography from '@/components/general/typography';
import Container from '@/components/layout/container';

const CertificatesSection = () => {
  return (
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
        {CERTIFICATES?.map((certificate, index) => (
          <CertificateDetails key={index} {...certificate} />
        ))}
      </div>
    </Container>
  );
};

export default CertificatesSection;