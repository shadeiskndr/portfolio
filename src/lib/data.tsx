import { Github, Linkedin, Mail, MessageCircle, Twitter, Instagram, Facebook } from 'lucide-react';

import LogoJava from '/public/images/logos/icon-java.svg';
import LogoJavascript from '/public/images/logos/icon-javascript.svg';
import LogoTypescript from '/public/images/logos/icon-typescript.svg';
import LogoHTML from '/public/images/logos/icon-html.svg';
import LogoPython from '/public/images/logos/icon-python.svg';
import LogoDart from '/public/images/logos/icon-dart.svg';
import LogoCSS from '/public/images/logos/icon-css.svg';
import LogoPHP from '/public/images/logos/icon-php.svg';

import LogoReact from '/public/images/logos/icon-react.svg';
import LogoNextjs from '/public/images/logos/icon-nextjs.svg';
import LogoAstro from '/public/images/logos/icon-astro.svg';
import LogoNodejs from '/public/images/logos/icon-nodejs.svg';
import LogoJakarta from '/public/images/logos/icon-jakarta.svg';
import LogoFlutter from '/public/images/logos/icon-flutter.svg';
import LogoAnt from '/public/images/logos/icon-ant.svg';
import LogoTailwindcss from '/public/images/logos/icon-tailwindcss.svg';
import LogoReactNative from '/public/images/logos/icon-reactnative.svg';
import LogoLaravel from '/public/images/logos/icon-laravel.svg';
import LogoXAMPP from '/public/images/logos/icon-xampp.svg';
import LogoGlassfish from '/public/images/logos/icon-glassfish.svg';

import LogoMySQL from '/public/images/logos/icon-mysql.svg';
import LogoSqlite from '/public/images/logos/icon-sqlite.svg';
import LogoAppwrite from '/public/images/logos/icon-appwrite.svg';
import LogoFirebase from '/public/images/logos/icon-firebase.svg';
import LogoMongoDB from '/public/images/logos/icon-mongodb.svg';
import LogoPrisma from '/public/images/logos/icon-prisma.svg';
import LogoMariaDB from '/public/images/logos/icon-mariadb.svg';

import LogoGit from '/public/images/logos/icon-git.svg';
import LogoDocker from '/public/images/logos/icon-docker.svg';
import LogoAWS from '/public/images/logos/icon-aws.svg';
import LogoVercel from '/public/images/logos/icon-vercel.png';
import LogoNetlify from '/public/images/logos/icon-netlify.svg';
import LogoHeroku from '/public/images/logos/icon-heroku.svg';
import LogoDigitalOcean from '/public/images/logos/icon-digitalocean.svg';
import LogoGoogleCloud from '/public/images/logos/icon-googlecloud.svg';

import LogoVSCode from '/public/images/logos/icon-vscode.svg';
import LogoNetbeans from '/public/images/logos/icon-netbeans.png';
import LogoEclipse from '/public/images/logos/icon-eclipse.svg';
import LogoIntelliJ from '/public/images/logos/icon-intellij.svg';
import LogoSublimeText from '/public/images/logos/icon-sublimetext.svg';

import LogoFigma from '/public/images/logos/icon-figma.svg';
import LogoPhotoshop from '/public/images/logos/icon-photoshop.svg';
import LogoIllustrator from '/public/images/logos/icon-illustrator.svg';
import LogoCanva from '/public/images/logos/icon-canva.svg';
import LogoPowerpoint from '/public/images/logos/icon-powerpoint.svg';

import LogoWord from '/public/images/logos/icon-word.svg';
import LogoExcel from '/public/images/logos/icon-excel.svg';
import LogoOverleaf from '/public/images/logos/icon-overleaf.png';

import Logo99 from '/public/images/logos/logo-99.png';

import ProjectCatalogd from '/public/images/project-catalogd.png';
import ProjectShahathirme from '/public/images/project-shahathirme.jpg';
import ProjectEduCafe from '/public/images/project-educafe.jpg';

import CertificateGPM from '/public/images/certificate-gpm.png';
import CertificateITAP from '/public/images/certificate-itap.png';
import CertificateITS from '/public/images/certificate-its.png';
import CertificateSEC from '/public/images/certificate-sec.png';
import CertificateUXD from '/public/images/certificate-uxd.png';

import AvatarKrisztian from '/public/images/avatar-krisztian.png';
import AvatarEugen from '/public/images/avatar-eugen.png';
import AvatarDummy from '/public/images/avatar-dummy.svg';

import {
  CertificateDetails,
  ExperienceDetails,
  ProjectDetails,
  TechDetails,
  TestimonialDetails,
} from '@/lib/types';

export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/shadeiskndr',
  //TWITTER: 'https://twitter.com/shadeiskndr',
  UNIKL: 'https://miit.unikl.edu.my/',
  };

export const NAV_LINKS = [
  {
    label: 'About',
    href: '#about',
  },
  {
    label: 'Education',
    href: '#projects',
  },
  {
    label: 'Skills',
    href: '#testimonials',
  },
  {
    label: 'Projects',
    href: '#projects',
  },
  {
    label: 'Experience',
    href: '#testimonials',
  },
  {
    label: 'Certificates',
    href: '#testimonials',
  },
  {
    label: 'Contact',
    href: '#contact',
  },
];

export const SOCIAL_LINKS = [
  {
    icon: Github,
    url: 'https://github.com/shadeiskndr',
  },
  {
    icon: Linkedin,
    url: 'https://www.linkedin.com/in/shahathir-iskandar-b60869270/',
  },
  {
    icon: Mail,
    url: 'mailto:shahathiriskandar43@gmail.com',
  },
  {
    icon: MessageCircle,
    url: 'https://wa.me/601153787564',
  },
  /*{
    icon: Twitter,
    url: 'https://twitter.com/shadeiskndr',
  },*/
  {
    icon: Instagram,
    url: 'https://www.instagram.com/shadeiskndr',
  },
  {
    icon: Facebook,
    url: 'https://www.facebook.com/shahathir.iskandar/',
  },
];

export const LANGUAGES: TechDetails[] = [
  {
    label: 'Java',
    logo: LogoJava,
    url: 'https://docs.oracle.com/en/java/',
  },
  {
    label: 'Javascript',
    logo: LogoJavascript,
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    label: 'Typescript',
    logo: LogoTypescript,
    url: 'https://www.typescriptlang.org/',
  },
  {
    label: 'Dart',
    logo: LogoDart,
    url: 'https://www.mongodb.com/',
  },
  {
    label: 'PHP',
    logo: LogoPHP,
    url: 'https://tailwindcss.com/',
  },
  {
    label: 'Python',
    logo: LogoPython,
    url: 'https://www.figma.com/',
  },
  {
    label: 'HTML',
    logo: LogoHTML,
    url: 'https://git-scm.com/',
  },
  {
    label: 'CSS',
    logo: LogoCSS,
    url: 'https://git-scm.com/',
  },
];

export const FRAMEWORKS: TechDetails[] = [
  {
    label: 'Next.js',
    logo: LogoNextjs,
    url: 'https://nextjs.org/',
  },
  {
    label: 'React.js',
    logo: LogoReact,
    url: 'https://react.dev/',
  },
  {
    label: 'Astro',
    logo: LogoAstro,
    url: 'https://react.dev/',
  },
  {
    label: 'Node.js',
    logo: LogoNodejs,
    url: 'https://nodejs.org/en',
  },
  {
    label: 'Java EE',
    logo: LogoJakarta,
    url: 'https://www.figma.com/',
  },
  {
    label: 'Flutter',
    logo: LogoFlutter,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Tailwindcss',
    logo: LogoTailwindcss,
    url: 'https://tailwindcss.com/',
  },
  {
    label: 'Java Ant',
    logo: LogoAnt,
    url: 'https://git-scm.com/',
  },
  {
    label: 'React Native',
    logo: LogoReactNative,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Laravel',
    logo: LogoLaravel,
    url: 'https://git-scm.com/',
  },
  {
    label: 'XAMPP',
    logo: LogoXAMPP,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Glassfish',
    logo: LogoGlassfish,
    url: 'https://git-scm.com/',
  },
];

export const DATABASES: TechDetails[] = [
  {
    label: 'MySQL',
    logo: LogoMySQL,
    url: 'https://www.figma.com/',
  },
  {
    label: 'SQLite',
    logo: LogoSqlite,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Appwrite',
    logo: LogoAppwrite,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Firebase',
    logo: LogoFirebase,
    url: 'https://git-scm.com/',
  },
  {
    label: 'MongoDB',
    logo: LogoMongoDB,
    url: 'https://git-scm.com/',
  },
  {
    label: 'PrismaDB',
    logo: LogoPrisma,
    url: 'https://git-scm.com/',
  },
  {
    label: 'MariaDB',
    logo: LogoMariaDB,
    url: 'https://git-scm.com/',
  },
];

export const CLOUDDEVOPS: TechDetails[] = [
  {
    label: 'Git',
    logo: LogoGit,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Docker',
    logo: LogoDocker,
    url: 'https://www.figma.com/',
  },
  {
    label: 'AWS',
    logo: LogoAWS,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Vercel',
    logo: LogoVercel,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Netlify',
    logo: LogoNetlify,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Heroku',
    logo: LogoHeroku,
    url: 'https://git-scm.com/',
  },
  {
    label: 'DigitalOcean',
    logo: LogoDigitalOcean,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Google Cloud',
    logo: LogoGoogleCloud,
    url: 'https://git-scm.com/',
  },
];

export const EDITOR: TechDetails[] = [
  {
    label: 'VS Code',
    logo: LogoVSCode,
    url: 'https://www.figma.com/',
  },
  {
    label: 'Netbeans',
    logo: LogoNetbeans,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Eclipse',
    logo: LogoEclipse,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Sublime Text',
    logo: LogoSublimeText,
    url: 'https://git-scm.com/',
  },
  {
    label: 'IntelliJ',
    logo: LogoIntelliJ,
    url: 'https://git-scm.com/',
  },
];

export const DESIGNTOOLS: TechDetails[] = [
  {
    label: 'Figma',
    logo: LogoFigma,
    url: 'https://www.figma.com/',
  },
  {
    label: 'Photoshop',
    logo: LogoPhotoshop,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Illustrator',
    logo: LogoIllustrator,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Canva',
    logo: LogoCanva,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Powerpoint',
    logo: LogoPowerpoint,
    url: 'https://git-scm.com/',
  },
];

export const DOCTOOLS: TechDetails[] = [
  {
    label: 'Word',
    logo: LogoWord,
    url: 'https://www.figma.com/',
  },
  {
    label: 'Excel',
    logo: LogoExcel,
    url: 'https://git-scm.com/',
  },
  {
    label: 'Overleaf (LaTeX)',
    logo: LogoOverleaf,
    url: 'https://git-scm.com/',
  },
];

export const EXPERIENCES: ExperienceDetails[] = [
  {
    logo: Logo99,
    logoAlt: '99 Speedmart logo',
    position: 'Storekeeper',
    startDate: new Date(2020, 1),
    endDate: new Date(2020, 5),
    //currentlyWorkHere: true,
    summary: [
      'Coordinated with the store manager to restock inventory as needed, performed regular stock checks and reported any issues to the store manager immediately.',
      'Organized the store area for ease of access and optimal space utilization.',
    ],
  },
/*{
    logo: LogoDotnpixel,
    darkModeLogo: LogoDotnpixelLight,
    logoAlt: 'Dotnpixel logo',
    position: 'Full Stack Developer',
    startDate: new Date(2015, 11),
    endDate: new Date(2017, 4),
    summary: ['Worked as a full stack developer (React / Laravel).'],
  },*/
];

export const PROJECTS: ProjectDetails[] = [
  {
    name: 'Catalogd',
    description:
      'A social cataloging web application for video game enthusiasts. Designed to provide a platform where video game enthusiasts can catalog their gaming experiences, discover new  titles, share reviews, and connect with others. A final year project (FYP) to complete my Bachelor.',
    url: 'https://catalogd-fyp.vercel.app',
    previewImage: ProjectCatalogd,
    technologies: [
      'Next.js',
      'Typescript',
      'React',
      'Appwrite',
      'Tailwind CSS',
    ],
  },
  {
    name: 'Shahathir.me',
    description:
      'A portfolio website created to showcase information about me, my technical skills, the projects that I have done and my experiences. Used various NextJS UI libraries to make the website beautiful.',
    url: 'https://shahathir.me',
    previewImage: ProjectShahathirme,
    technologies: [
      'Next.js',
      'React',
      'Typescript',
      'Tailwind CSS',
    ],
  },
  {
    name: 'EduCafe Booking',
    description:
      'EduCafe Booking is a school cafeteria service web-app that allows students to order their meals remotely, enables staff to manage food bookings, and improves the manager’s workflow. Developed using JSP, Servlets, and Tailwind CSS for the UI, implemented business logic with Enterprise Java Beans (EJBs) from Java EE, and integrated a MySQL database for data storage. This is a university project for the ISB37804 Reuse and Component Based Development class.',
    url: 'https://github.com/shadeiskndr?tab=repositories',
    previewImage: ProjectEduCafe,
    technologies: [
      'Java',
      'Java EE',
      'MySQL',
      'Tailwind CSS',
      'JSP',
      'Servlet',
    ],
  },
];

export const TESTIMONIALS: TestimonialDetails[] = [
  {
    personName: 'Krisztian Gyuris',
    personAvatar: AvatarKrisztian,
    title: 'Founder - inboxgenie.io',
    testimonial:
      'Job well done! I am really impressed. He is very very good at what he does:) I would recommend Sagar and will rehire in the future for Frontend development.',
  },
  {
    personName: 'Eugen Esanu',
    personAvatar: AvatarEugen,
    title: 'Founder - shosho.design',
    testimonial:
      'Great guy, highly recommended for any COMPLEX front-end development job! His skills are top-notch and he will be an amazing addition to any team.',
  },
  {
    personName: 'Joe Matkin',
    personAvatar: AvatarDummy,
    title: 'Freelancer',
    testimonial:
      'Sagar was extremely easy and pleasant to work with and he truly cares about the project being a success. Sagar has a high level of knowledge and was able to work on my MERN stack application without any issues.',
  },
];

export const CERTIFICATES: CertificateDetails[] = [
  {
    certificateName: 'Google Project Management Professional Certificate',
    certificateImage: CertificateGPM,
    certificateSource: 'Coursera',
    certificateDescription:
      ' Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.',
    url: 'https://www.coursera.org/account/accomplishments/specialization/8L4C2AHPPWMP',
    },
  {
    certificateName: 'Google IT Automation with Python Professional Certificate',
    certificateImage: CertificateITAP,
    certificateSource: 'Coursera',
    certificateDescription:
      ' Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.',
    url: 'https://www.coursera.org/account/accomplishments/specialization/KWQAJCAQAYY2',
    },
  {
    certificateName: 'Google IT Support Professional Certificate',
    certificateImage: CertificateITS,
    certificateSource: 'Coursera',
    certificateDescription:
      ' Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.',
    url: 'https://www.coursera.org/account/accomplishments/specialization/SF3NTQPRQZLB',
    },
  {
    certificateName: 'Google Cybersecurity Professional Certificate',
    certificateImage: CertificateSEC,
    certificateSource: 'Coursera',
    certificateDescription:
      ' Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.',
    url: 'https://www.coursera.org/account/accomplishments/specialization/KWPRBNTZCGKK',
    },
  {
    certificateName: 'Google UX Design Professional Certificate',
    certificateImage: CertificateUXD,
    certificateSource: 'Coursera',
    certificateDescription:
      ' Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.',
    url: 'https://www.coursera.org/account/accomplishments/specialization/JD7XZR37DJSU',
  },
];
