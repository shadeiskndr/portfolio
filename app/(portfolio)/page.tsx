import AboutMeSection from "@/components/old-portfolio/sections/about-me";
import CertificatesSection from "@/components/old-portfolio/sections/certificates";
import ContactSection from "@/components/old-portfolio/sections/contact";
import EducationSection from "@/components/old-portfolio/sections/education";
import ExperienceSection from "@/components/old-portfolio/sections/experiences";
import HeroSection from "@/components/old-portfolio/sections/hero";
import SkillsSection from "@/components/old-portfolio/sections/skills";
// import TestimonialsSection from '@/components/sections/testimonials';
import WorkSection from "@/components/old-portfolio/sections/work";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutMeSection />
      <WorkSection />
      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <CertificatesSection />
      <ContactSection />
    </>
  );
}
