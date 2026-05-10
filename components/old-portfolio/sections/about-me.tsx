import Image from "next/image";
import Tag from "@/components/old-portfolio/data-display/tag";
import Typography from "@/components/old-portfolio/general/typography";
import Container from "@/components/old-portfolio/layout/container";
import Link from "@/components/old-portfolio/navigation/link";
import { EXTERNAL_LINKS } from "@/lib/data";
import ShahathirFullPose from "@/public/images/shahathir-full-pose.png";

const AboutMeSection = () => {
  return (
    <Container id="about">
      <div className="self-center">
        <Tag label="About me" />
      </div>

      <div className="flex w-full flex-col justify-between gap-12 md:flex-row">
        {/* Image */}
        <div className="flex justify-center md:order-first md:justify-end">
          <div className="relative h-95 w-[320px] md:h-115 md:w-95 lg:h-130 lg:w-110">
            <Image
              src={ShahathirFullPose}
              alt="Fullpose of Shahathir"
              loading="eager"
              fetchPriority="high"
              className="absolute z-10 h-90 w-70 border-8 bg-background max-md:left-5 md:top-0 md:right-0 md:h-105 md:w-85 lg:h-120 lg:w-100"
              style={{ objectFit: "cover" }}
            ></Image>
            <div className="absolute h-90 w-[320px] border-8 bg-background max-md:top-5 md:bottom-0 md:left-0 md:h-105 md:w-85 lg:h-120 lg:w-100"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-w-xl flex-col gap-6">
          <Typography variant="h3">Get to know me 😀</Typography>
          <Typography className="text-foreground">
            I&apos;m a software developer recently graduated from the{" "}
            <Link noCustomization externalLink withUnderline href={EXTERNAL_LINKS.UNIKL}>
              Universiti Kuala Lumpur Malaysian Institute of Information Technology (UniKL MIIT)
            </Link>
            . I have a strong passion for programming and developing software, from simple landing
            pages to complex web, mobile and desktop applications. I have also obtained several
            certificates that prove my commitment to lifelong learning.
          </Typography>
          <Typography className="text-foreground">
            I started my journey into the world of programming at 15, taking computer science
            classes during my high school years. I don&apos;t imagine myself doing anything else as
            seriously. Since then, I&apos;ve continued to grow and evolve as a developer, always
            looking for new challenges and opportunities to learn the latest technologies.
          </Typography>
          <Typography className="text-foreground">
            I&apos;m someone who plans ahead, always thinking of proper solutions for my projects or
            assignments. I&apos;m a dedicated team player with a strong work ethic. Also, I&apos;m
            certainly someone who you can fully trust to get a job done well.
          </Typography>
          <Typography className="text-foreground">
            Whenever I am not coding or programming, I like to spend that leisure time by watching
            new TV shows or movies, reading blogs or social posts, or following new programming
            tutorials.
          </Typography>
          <Typography className="text-foreground">
            Here are some interesting facts about me:
          </Typography>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-foreground">
                Appreciates the LRT & MRT 🚇
              </Typography>
              <Typography component="li" className="text-foreground">
                Music lover 🎧
              </Typography>
            </ul>
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li" className="text-foreground">
                Free & open software advocate 🙌🏻
              </Typography>
              <Typography component="li" className="text-foreground">
                PC & Gadget enthusiast 🖱️
              </Typography>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AboutMeSection;
