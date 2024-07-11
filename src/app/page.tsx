import HeroSection from '@/components/sections/hero';
import ContactSection from '@/components/sections/contact';
import AboutMeSection from '@/components/sections/about-me';
import SkillsSection from '@/components/sections/skills';
import ExperienceSection from '@/components/sections/experiences';
import EducationSection from '@/components/sections/education';
import TestimonialsSection from '@/components/sections/testimonials';
import WorkSection from '@/components/sections/work';
import CertificatesSection from '@/components/sections/certificates';

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutMeSection />
      <EducationSection />
      <WorkSection />
      <SkillsSection />
      <ExperienceSection />
      <CertificatesSection />
      <ContactSection />
    </>
  );
}
