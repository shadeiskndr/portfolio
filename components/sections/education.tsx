import Image from "next/image";

import UniKLImage from "/public/images/logos/unikl-image.jpg";
import Tag from "@/components/data-display/tag";
import Container from "@/components/layout/container";
import Typography from "@/components/general/typography";

const EducationSection = () => {
  return (
    <Container className="" id="education">
      <div className="self-center">
        <Tag label="Education" />
      </div>

      <div className="flex w-full flex-col justify-between gap-12 md:flex-row">
        {/* Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative h-[380px] w-[320px] md:h-[460px] md:w-[380px] lg:h-[520px] lg:w-[440px]">
            <Image
              src={UniKLImage}
              alt="Image of UniKL MIIT Campus"
              className="border-gray bg-background absolute z-10 h-[360px] w-[280px] border-8 max-md:left-5 md:top-0 md:left-0 md:h-[420px] md:w-[340px] lg:h-[480px] lg:w-[400px]"
              style={{ objectFit: "cover" }}
            ></Image>
            <div className="bg-background absolute h-[360px] w-[320px] border-8 border-transparent max-md:top-5 md:right-0 md:bottom-0 md:h-[420px] md:w-[340px] lg:h-[480px] lg:w-[400px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-w-xl flex-col gap-6 sm:order-last md:order-first lg:order-first">
          <Typography variant="h3">
            Bachelor of Information Technology (Hons.) in Software Engineering
          </Typography>
          <Typography variant="body1" className="text-secondary-foreground">
            Universiti Kuala Lumpur - Malaysian Institute of Information Technology (UniKL MIIT)
          </Typography>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                CGPA: 3.78/4.00
              </Typography>
            </ul>
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                Sept 2021 to Feb 2025
              </Typography>
            </ul>
          </div>
          <Typography variant="body1"></Typography>
          <Typography variant="body1"></Typography>
          <Typography variant="h3">Foundation in Science</Typography>
          <Typography variant="body1" className="text-secondary-foreground">
            Universiti Teknologi MARA
          </Typography>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                CGPA: 3.67/4.00
              </Typography>
            </ul>
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                June 2020 to June 2021
              </Typography>
            </ul>
          </div>
          <Typography variant="body1"></Typography>
          <Typography variant="body1"></Typography>
          <Typography variant="h3">Malaysian Certificate of Education (SPM)</Typography>
          <Typography variant="body1" className="text-secondary-foreground">
            Sekolah Menengah Kebangsaan Sungai Pusu
          </Typography>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                Result: 3A+, 6A, 1B+
              </Typography>
            </ul>
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-muted-foreground">
                2015 to 2019
              </Typography>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default EducationSection;
