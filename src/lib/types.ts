import type { StaticImageData } from 'next/image';

export type TechDetails = {
  logo: string | StaticImageData;
  darkModeLogo?: string | StaticImageData;
  label: string;
  url: string;
};

export type ExperienceDetails = {
  logo: string | StaticImageData;
  darkModeLogo?: string | StaticImageData;
  logoAlt: string;
  position: string;
  currentlyWorkHere?: boolean;
  startDate: Date;
  endDate?: Date;
  summary: string[];
};

export type ProjectDetails = {
  name: string;
  description: string;
  url: string;
  previewImage: string | StaticImageData;
  technologies: string[];
  gifUrl?: string; // Add this line
};


export type TestimonialDetails = {
  personName: string;
  personAvatar?: string | StaticImageData;
  testimonial: string;
  title: string;
};

export type CertificateDetails = {
  certificateName: string;
  certificateImage?: string | StaticImageData;
  certificateDescription: string;
  certificateSource: string;
  url: string;
};

