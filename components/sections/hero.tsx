import { MapPin } from "lucide-react";
import Image from "next/image";
import SocialIcons from "@/components/data-display/social-icons";
import DownloadCV from "@/components/general/download-cv";
import Typography from "@/components/general/typography";
import Container from "@/components/layout/container";
import ShahathirHeadshot4 from "@/public/images/flipped-transparent-selfie.png";

const HeroSection = () => {
  return (
    <Container id="hero">
      <div className="flex flex-col gap-12 md:flex-row">
        {/* Image */}
        <div className="flex items-center justify-center md:order-last md:grow md:justify-end">
          <div className="relative h-75 w-70 md:h-87.5 md:w-[320px]">
            <Image
              src={ShahathirHeadshot4}
              alt="Headshot of Shahathir"
              className="absolute z-10 h-70 w-60 border-8 border-gray bg-background max-md:left-5 md:top-0 md:left-0 md:h-80 md:w-70"
              style={{ objectFit: "cover" }}
            ></Image>
            <div className="absolute h-70 w-70 border-8 border-transparent bg-background max-md:top-5 md:right-0 md:bottom-0 md:h-80 md:w-70"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-w-3xl grow flex-col justify-center gap-8 md:order-first md:items-start md:justify-center 2xl:gap-12">
          <div className="flex flex-col gap-2">
            <Typography>Hey, I&apos;m</Typography>
            <Typography variant="h1">
              Shahathir Iskandar <span className="inline-block animate-waving-hand">👋</span>
            </Typography>
            <Typography className="text-foreground">
              Versatile and motivated individual with a passion for software development.
              Experienced in creating robust and user-friendly websites and applications.
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <MapPin className="secondary-foreground" />
              <Typography className="text-foreground">
                Batu Caves / Kuala Lumpur | Malaysia
              </Typography>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </span>
              </div>
              <Typography className="text-foreground">
                Searching for opportunities as a Software Developer (Web / Frontend / Fullstack)
              </Typography>
            </div>
          </div>
          <div className="flex flex-row gap-10">
            <SocialIcons />
            <DownloadCV />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HeroSection;
