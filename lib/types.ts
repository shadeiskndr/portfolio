export type ExperienceDetails = {
  logoKey: string;
  darkLogoKey?: string;
  logoAlt: string;
  position: string;
  currentlyWorkHere?: boolean;
  startDate: Date;
  endDate?: Date;
  summary: string[];
  attachedFileKey?: string;
};

export type ProjectDetails = {
  name: string;
  description: string;
  url: string;
  previewImageKey: string;
  technologies: string[];
};

export type TestimonialDetails = {
  personName: string;
  testimonial: string;
  title: string;
};

export type CertificateDetails = {
  certificateName: string;
  certificateImageKey?: string;
  certificateDescription: string;
  certificateSource: string;
  url: string;
};
