import Image from 'next/image';
import { MapPin } from 'lucide-react';

import ShahathirHeadshot from '/public/images/shahathir-headshot.webp';
import ShahathirHeadshot2 from '/public/images/transparent selfie-Photoroom-cropped.png';
import ShahathirHeadshot3 from '/public/images/transparent selfie-Photoroom.png';
import ShahathirHeadshot4 from '/public/images/flipped-transparent-selfie.png';
import SocialIcons from '@/components/data-display/social-icons';
import Typography from '@/components/general/typography';
import Container from '@/components/layout/container';
import DownloadCV from '@/components/general/download-cv';

const HeroSection = () => {
  return (
    <Container id="hero">
      <div className="flex flex-col gap-12 md:flex-row">
        {/* Image */}
        <div className="flex items-center justify-center md:order-last md:flex-grow md:justify-end">
          <div className="relative h-[300px] w-[280px] md:h-[350px] md:w-[320px]">
            <Image
              src={ShahathirHeadshot4}
              alt="Headshot of Shahathir"
              className="absolute z-10 h-[280px] w-[240px] border-8 border-gray bg-gray-200 max-md:left-5 md:left-0 md:top-0 md:h-[320px] md:w-[280px]"
              style={{ objectFit: 'cover' }}
            ></Image>
            <div className="absolute h-[280px] w-[280px] border-8 border-transparent bg-gray-200 max-md:top-5 md:bottom-0 md:right-0 md:h-[320px] md:w-[280px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-w-3xl flex-grow flex-col justify-center gap-8 md:order-first md:items-start md:justify-center 2xl:gap-12">
          <div className="flex flex-col gap-2">
          <Typography>
              Hey, I&apos;m
            </Typography>
            <Typography variant="h1">
              Shahathir Iskandar{' '}
              <span className="inline-block animate-waving-hand">👋</span>
            </Typography>
            <Typography>
            Versatile and motivated 22 year-old Malaysian Software Engineering undergraduate with
            an affinity for software development ranging from web, mobile and desktop applications.
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <MapPin className="stroke-gray-600" />
              <Typography>Batu Caves / Kuala Lumpur | Malaysia</Typography>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              </div>
              <Typography>Currently interning as a Software Engineer at The Estee Lauder Companies Inc.</Typography>
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
