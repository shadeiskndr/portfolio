import AboutMeSection from "@/components/sections/about-me";
import CertificatesSection from "@/components/sections/certificates";
import ContactSection from "@/components/sections/contact";
import EducationSection from "@/components/sections/education";
import ExperienceSection from "@/components/sections/experiences";
import HeroSection from "@/components/sections/hero";
import SkillsSection from "@/components/sections/skills";
// import TestimonialsSection from '@/components/sections/testimonials';
import WorkSection from "@/components/sections/work";

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
