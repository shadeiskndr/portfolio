import Image from 'next/image';

import ShahathirFullPose from '/public/images/shahathir-full-pose.png';
import Tag from '@/components/data-display/tag';
import Container from '@/components/layout/container';
import Typography from '@/components/general/typography';
import Link from '@/components/navigation/link';
import { EXTERNAL_LINKS } from '@/lib/data';

const AboutMeSection = () => {
  return (
    <Container className="bg-gray-50" id="about">
      <div className="self-center">
        <Tag label="About me" />
      </div>

      <div className="flex w-full flex-col justify-between gap-12 md:flex-row">
        {/* Image */}
        <div className="flex justify-center md:order-first md:justify-end">
          <div className="relative h-[380px] w-[320px] md:h-[460px] md:w-[380px] lg:h-[520px] lg:w-[440px]">
            <Image
              src={ShahathirFullPose}
              alt="Fullpose of Shahathir"
              className="absolute z-10 h-[360px] w-[280px] border-8 border-gray-50 bg-gray-200 max-md:left-5 md:right-0 md:top-0 md:h-[420px] md:w-[340px] lg:h-[480px] lg:w-[400px]"
              style={{ objectFit: 'cover' }}
            ></Image>
            <div className="absolute h-[360px] w-[320px] border-8 border-transparent bg-gray-200 max-md:top-5 md:bottom-0 md:left-0 md:h-[420px] md:w-[340px] lg:h-[480px] lg:w-[400px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-w-xl flex-col gap-6">
          <Typography variant="h3">
            Get to know me 😉
          </Typography>
          <Typography>
          I&apos;m a final-year Software Engineering student at the{' '}
            <Link
              noCustomization
              externalLink
              withUnderline
              href={EXTERNAL_LINKS.UNIKL}
            >
              Universiti Kuala Lumpur
              Malaysian Institute of Information Technology (UniKL MIIT)
            </Link>.{' '}
          I have a strong passion for programming and developing software, from 
          simple landing pages to complex web, mobile and desktop applications. 
          I have also obtained several certificates that prove my commitment to lifelong learning.
          </Typography>
          <Typography>
          I started my journey into the world of programming at 15, taking computer science 
          classes during my high school years. I don&apos;t imagine myself doing anything 
          else as seriously. Since then, I&apos;ve continued to grow and evolve as a developer, 
          always looking for new challenges and opportunities to learn the latest technologies.
          </Typography>
          <Typography>
          I&apos;m someone who plans ahead, always thinking of proper solutions for my projects 
          or assignments. I&apos;m a dedicated team player with a strong work ethic. Also, I&apos;m 
          certainly someone who you can fully trust to get a job done well.
          </Typography>
          <Typography>
          Whenever there is leisure time, I like to spend it by watching TV shows and movies, 
          playing video games, browsing social media, or following new programming tutorials.
          </Typography>
          <Typography>Here are some interesting facts about me:</Typography>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li">
                Loves the LRT & MRT 🚇
              </Typography>
              <Typography component="li">Punk & rock listener 🎧🎸</Typography>
            </ul>
            <ul className="flex list-inside list-disc flex-col gap-2">
              <Typography component="li">Free & open software advocate 🙌🏻</Typography>
              <Typography component="li">PC & Gadget enthusiast 🖱️</Typography>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AboutMeSection;
