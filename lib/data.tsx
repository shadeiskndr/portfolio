import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";

import LogoJava from "/public/images/logos/icon-java.svg";
import LogoJavascript from "/public/images/logos/icon-javascript.svg";
import LogoTypescript from "/public/images/logos/icon-typescript.svg";
import LogoHTML from "/public/images/logos/icon-html.svg";
import LogoPython from "/public/images/logos/icon-python.svg";
import LogoCSS from "/public/images/logos/icon-css.svg";
import LogoPHP from "/public/images/logos/icon-php.svg";

import LogoReact from "/public/images/logos/icon-react.svg";
import LogoNextjs from "/public/images/logos/icon-nextjs.svg";
import LogoNodejs from "/public/images/logos/icon-nodejs.svg";
import LogoJakarta from "/public/images/logos/icon-jakarta.svg";
import LogoTailwindcss from "/public/images/logos/icon-tailwindcss.svg";
import LogoSpring from "/public/images/logos/logo-springboot.svg";
import LogoVite from "/public/images/logos/logo-vite.svg";
import LogoRedux from "/public/images/logos/logo-redux.svg";
import LogoReactRouter from "/public/images/logos/logo-reactrouter.svg";
import LogoBootstrap from "/public/images/logos/logo-bootstrap.svg";
import LogoSCSS from "/public/images/logos/logo-scss.svg";
import LogoExpress from "/public/images/logos/logo-express.svg";
import LogoNginx from "/public/images/logos/logo-nginx.svg";
import LogoMSSQL from "/public/images/logos/logo-mssql.svg";
import LogoDBeaver from "/public/images/logos/logo-dbeaver.svg";
import LogoPostman from "/public/images/logos/logo-postman.svg";
import LogoMUI from "/public/images/logos/logo-mui.svg";
import LogoReactNative from "/public/images/logos/icon-reactnative.svg";
import LogoAngular from "/public/images/logos/icon-angular.svg";
import LogoDjango from "/public/images/logos/icon-django.svg";
import LogoFastApi from "/public/images/logos/icon-fastapi.svg";

import LogoPostgres from "/public/images/logos/icon-postgres.svg";
import LogoMySQL from "/public/images/logos/icon-mysql.svg";
import LogoSqlite from "/public/images/logos/icon-sqlite.svg";
import LogoAppwrite from "/public/images/logos/icon-appwrite.svg";

import LogoGit from "/public/images/logos/icon-git.svg";
import LogoDocker from "/public/images/logos/icon-docker.svg";
import LogoVercel from "/public/images/logos/icon-vercel.png";
import LogoNetlify from "/public/images/logos/icon-netlify.svg";
import LogoDigitalOcean from "/public/images/logos/icon-digitalocean.svg";

import LogoVSCode from "/public/images/logos/icon-vscode.svg";
import LogoNetbeans from "/public/images/logos/icon-netbeans.png";
import LogoIntelliJ from "/public/images/logos/icon-intellij.svg";
import LogoSublimeText from "/public/images/logos/icon-sublimetext.svg";

import LogoFigma from "/public/images/logos/icon-figma.svg";
import LogoPhotoshop from "/public/images/logos/icon-photoshop.svg";
import LogoIllustrator from "/public/images/logos/icon-illustrator.svg";
import LogoCanva from "/public/images/logos/icon-canva.svg";
import LogoPowerpoint from "/public/images/logos/icon-powerpoint.svg";

import LogoWord from "/public/images/logos/icon-word.svg";
import LogoExcel from "/public/images/logos/icon-excel.svg";
import LogoOverleaf from "/public/images/logos/icon-overleaf.png";

import Logo99 from "/public/images/logos/logo-99.png";
import LogoEstee from "/public/images/logos/logo-estee.png";
import LogoEsteeDark from "/public/images/logos/logo-estee-dark.png";
import LogoFRG from "/public/images/logos/logo-frg-dark.png";
import LogoFRGLight from "/public/images/logos/logo-frg-light.png";

import ProjectCatalogd from "/public/images/project-catalogd.png";
import ProjectAIGame from "/public/images/project-aigamerecommender.jpg";
import ProjectShahathirme from "/public/images/project-shahathirme.jpg";
import ProjectCountryEconomicDashboard from "/public/images/project-countryeconomicdashboard.png";
import ProjectTodoList from "/public/images/project-todolist.png";
import ProjectEduCafe from "/public/images/project-educafe.jpg";
import ProjectPHPDocker from "/public/images/project-phpdocker.png";

import CertificateGPM from "/public/images/certificate-GPM.png";
import CertificateITAP from "/public/images/certificate-ITAP.png";
import CertificateITS from "/public/images/certificate-ITS.png";
import CertificateSEC from "/public/images/certificate-SEC.png";
import CertificateUXD from "/public/images/certificate-UXD.png";

import AvatarKrisztian from "/public/images/avatar-krisztian.png";
import AvatarEugen from "/public/images/avatar-eugen.png";
import AvatarDummy from "/public/images/avatar-dummy.svg";

import {
  CertificateDetails,
  ExperienceDetails,
  ProjectDetails,
  TechDetails,
  TestimonialDetails,
} from "@/lib/types";

export const EXTERNAL_LINKS = {
  GITHUB: "https://github.com/shadeiskndr",
  UNIKL: "https://miit.unikl.edu.my/",
};

export const NAV_LINKS = [
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Education",
    href: "#education",
  },
  {
    label: "Projects",
    href: "#projects",
  },
  {
    label: "Skills",
    href: "#skills",
  },
  {
    label: "Experience",
    href: "#experience",
  },
  {
    label: "Certificates",
    href: "#certificates",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export const SOCIAL_LINKS = [
  {
    icon: Github,
    url: "https://github.com/shadeiskndr",
  },
  {
    icon: Linkedin,
    url: "https://www.linkedin.com/in/shahathir-iskandar-b60869270/",
  },
  {
    icon: Mail,
    url: "mailto:shahathiriskandar43@gmail.com",
  },
  {
    icon: MessageCircle,
    url: "https://wa.me/601153787564",
  },
];

export const LANGUAGES: TechDetails[] = [
  {
    label: "Java",
    logo: LogoJava,
    url: "https://docs.oracle.com/en/java/",
  },
  {
    label: "Javascript",
    logo: LogoJavascript,
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  {
    label: "Typescript",
    logo: LogoTypescript,
    url: "https://www.typescriptlang.org/",
  },
  {
    label: "PHP",
    logo: LogoPHP,
    url: "https://www.php.net/manual/en/index.php",
  },
  {
    label: "Python",
    logo: LogoPython,
    url: "https://www.python.org/doc/",
  },
  {
    label: "HTML",
    logo: LogoHTML,
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  },
  {
    label: "CSS",
    logo: LogoCSS,
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
  },
];

export const FRONTEND: TechDetails[] = [
  {
    label: "React.js",
    logo: LogoReact,
    url: "https://react.dev/",
  },
  {
    label: "Next.js",
    logo: LogoNextjs,
    url: "https://nextjs.org/",
  },
  {
    label: "Vite",
    logo: LogoVite,
    url: "https://vitejs.dev/",
  },
  {
    label: "Redux",
    logo: LogoRedux,
    url: "https://redux.js.org/",
  },
  {
    label: "React Router",
    logo: LogoReactRouter,
    url: "https://reactrouter.com/en/main",
  },
  {
    label: "Material UI",
    logo: LogoMUI,
    url: "https://mui.com/material-ui/getting-started/overview/",
  },
  {
    label: "Tailwind CSS",
    logo: LogoTailwindcss,
    url: "https://tailwindcss.com/",
  },
  {
    label: "Bootstrap",
    logo: LogoBootstrap,
    url: "https://getbootstrap.com/",
  },
  {
    label: "SCSS",
    logo: LogoSCSS,
    url: "https://sass-lang.com/",
  },
  {
    label: "React Native",
    logo: LogoReactNative,
    url: "https://reactnative.dev/docs/getting-started",
  },
  {
    label: "Angular",
    logo: LogoAngular,
    url: "https://angular.io/docs",
  },
];

export const BACKEND: TechDetails[] = [
  {
    label: "Django",
    logo: LogoDjango,
    url: "https://www.djangoproject.com/",
  },
  {
    label: "FastAPI",
    logo: LogoFastApi,
    url: "https://fastapi.tiangolo.com/",
  },
  {
    label: "Spring Boot",
    logo: LogoSpring,
    url: "https://spring.io/projects/spring-boot",
  },
  {
    label: "Java Servlets",
    logo: LogoJakarta,
    url: "https://jakarta.ee/learn/docs/jakartaee-tutorial/current/index.html",
  },
  {
    label: "Node.js",
    logo: LogoNodejs,
    url: "https://nodejs.org/docs/latest/api/",
  },
  {
    label: "Express",
    logo: LogoExpress,
    url: "https://expressjs.com/en/starter/installing.html",
  },
  {
    label: "Vanilla PHP 8",
    logo: LogoPHP,
    url: "https://www.php.net/manual/en/index.php",
  },
];

export const DATABASES: TechDetails[] = [
  {
    label: "PostgreSQL",
    logo: LogoPostgres,
    url: "https://www.postgresql.org/docs/",
  },
  {
    label: "MySQL",
    logo: LogoMySQL,
    url: "https://dev.mysql.com/doc/",
  },
  {
    label: "MS SQL Server",
    logo: LogoMSSQL,
    url: "https://learn.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver16",
  },
  {
    label: "SQLite",
    logo: LogoSqlite,
    url: "https://www.sqlite.org/docs.html",
  },
  {
    label: "Appwrite",
    logo: LogoAppwrite,
    url: "https://appwrite.io/docs",
  },
];

export const CLOUDDEVOPS: TechDetails[] = [
  {
    label: "Git",
    logo: LogoGit,
    url: "https://git-scm.com/",
  },
  {
    label: "Docker",
    logo: LogoDocker,
    url: "https://docs.docker.com/",
  },
  {
    label: "Vercel",
    logo: LogoVercel,
    url: "https://vercel.com/docs",
  },
  {
    label: "Netlify",
    logo: LogoNetlify,
    url: "https://docs.netlify.com/",
  },
  {
    label: "DigitalOcean",
    logo: LogoDigitalOcean,
    url: "https://docs.digitalocean.com/",
  },
  {
    label: "Nginx",
    logo: LogoNginx,
    url: "https://docs.nginx.com/",
  },
  {
    label: "DBeaver",
    logo: LogoDBeaver,
    url: "https://dbeaver.io/docs/",
  },
  {
    label: "Postman",
    logo: LogoPostman,
    url: "https://www.postman.com/product/api-client/",
  },
];

export const EDITOR: TechDetails[] = [
  {
    label: "VS Code",
    logo: LogoVSCode,
    url: "https://code.visualstudio.com/docs",
  },
  {
    label: "Netbeans",
    logo: LogoNetbeans,
    url: "https://netbeans.apache.org/tutorial/main/kb/",
  },
  {
    label: "Sublime Text",
    logo: LogoSublimeText,
    url: "https://www.sublimetext.com/docs/",
  },
  {
    label: "IntelliJ",
    logo: LogoIntelliJ,
    url: "https://www.jetbrains.com/help/idea/getting-started.html",
  },
];

export const DESIGNTOOLS: TechDetails[] = [
  {
    label: "Figma",
    logo: LogoFigma,
    url: "https://www.figma.com/",
  },
  {
    label: "Photoshop",
    logo: LogoPhotoshop,
    url: "https://helpx.adobe.com/photoshop/user-guide.html",
  },
  {
    label: "Illustrator",
    logo: LogoIllustrator,
    url: "https://helpx.adobe.com/illustrator/user-guide.html",
  },
  {
    label: "Canva",
    logo: LogoCanva,
    url: "https://www.canva.com",
  },
  {
    label: "Powerpoint",
    logo: LogoPowerpoint,
    url: "https://www.microsoft.com/en-my/microsoft-365/powerpoint",
  },
];

export const DOCTOOLS: TechDetails[] = [
  {
    label: "Word",
    logo: LogoWord,
    url: "https://www.microsoft.com/en-my/microsoft-365/word",
  },
  {
    label: "Excel",
    logo: LogoExcel,
    url: "https://www.microsoft.com/en-my/microsoft-365/excel",
  },
  {
    label: "Overleaf (LaTeX)",
    logo: LogoOverleaf,
    url: "https://www.overleaf.com/",
  },
];

export const EXPERIENCES: ExperienceDetails[] = [
  {
    logo: LogoFRGLight,
    darkModeLogo: LogoFRG,
    logoAlt: "Financial Risk Group logo",
    position: "Assistant Software Developer",
    startDate: new Date(2025, 5),
    currentlyWorkHere: true,
    summary: [
      "Contributing to the development and maintenance of Financial Risk Group's Visualization of Risk (VOR) product and other internal tooling.",
      "Developed an internal AI agent web application from scratch to improve the onboarding of financial portfolio data for the business analytics team, using technologies such as React.js, Django, PostgreSQL, Strands Agents SDK, AWS Bedrock, Docker Compose.",
      "Performing root cause analysis and investigation for bug fixes.",
      "Creating detailed pull requests that includes summary, problem statement, solution and reviewer test plans to reduce technical debt and improve code documentation.",
      "Assisting with code reviews and testing to ensure high-quality software delivery.",
    ],
  },
  {
    logo: LogoEstee,
    darkModeLogo: LogoEsteeDark,
    logoAlt: "The Estee Lauder Companies logo",
    position: "Software Engineer Intern",
    startDate: new Date(2024, 9),
    endDate: new Date(2025, 1),
    summary: [
      "Contributed significantly to the development and delivery of an internal Support Portal full-stack web application to support Estee Lauder Companies' retail operations.",
      "Gained hands-on experience with retail software architecture and best practices in a production environment.",
      "Assisted in troubleshooting and resolving critical issues to ensure smooth operations for retail clients.",
      "Participated in code reviews and implemented improvements to enhance system performance and reliability.",
    ],
    attachedFile: "/files/Shahathir_Internship_Estee_Lauder_Malaysia.pdf",
  },
  {
    logo: Logo99,
    logoAlt: "99 Speedmart logo",
    position: "Logistics Associate",
    startDate: new Date(2020, 1),
    endDate: new Date(2020, 5),
    //currentlyWorkHere: true,
    summary: [
      "Coordinated with the store manager to restock inventory as needed, performed regular stock checks and reported any issues to the store manager immediately.",
      "Organized the store area for ease of access and optimal space utilization.",
    ],
  },
];

export const PROJECTS: ProjectDetails[] = [
  {
    name: "Catalogd",
    description:
      "A social cataloging web application for video game enthusiasts. Designed to provide a platform where video game enthusiasts can catalog their gaming experiences, discover new  titles, share reviews, and connect with others. A final year project (FYP) to complete my Bachelor.",
    url: "https://catalogd.shahathir.me",
    previewImage: ProjectCatalogd,
    technologies: ["Next.js", "Typescript", "React.js", "Appwrite", "Tailwind CSS"],
  },
  {
    name: "AI Game Recommender",
    description:
      "A web application that leverages AI through vector embedding to provide personalized video game recommendations through prompts & vector search. Over 20,000 video game titles recognized for vector search recommendations integrated into Catalogd. Integrated Open AI text-embed model with DataStax to calculate vector embedding for each video game title data.",
    url: "https://ai-game-recommender.shahathir.me",
    previewImage: ProjectAIGame,
    technologies: ["Next.js", "Typescript", "Tailwind CSS", "DataStax", "Open AI Text-Embed Model"],
  },
  {
    name: "Country Economic Indicator Analytics Dashboard",
    description:
      "A full-stack web application that serves to provide access and visualise various economic indicators of a specific country, including: GDP growth rates, population growth rates, education expenditure percentages, inflation rates and labour force statistics.",
    url: "https://github.com/shadeiskndr/tgp-challenge-api",
    previewImage: ProjectCountryEconomicDashboard,
    technologies: ["Spring Boot", "Java", "React.js", "TypeScript", "MySQL", "Material-UI", "JWT"],
    gifUrl:
      "https://raw.githubusercontent.com/shadeiskndr/shadeiskndr.github.io/main/uploads/countryeconomicdashboard.gif",
  },
  {
    name: "Todo List",
    description:
      "Built a full-stack to-do list web application for users to keep track of their daily tasks. Demonstrates integration between legacy COBOL systems, a modern Express.js API, and an Angular frontend. Utilized Docker Compose and Dockerfiles to simulate a legacy backend using GnuCOBOL docker image.",
    url: "https://github.com/shadeiskndr/cobol-express-angular-crud",
    previewImage: ProjectTodoList,
    technologies: ["COBOL", "Angular", "Express.js", "Node.js", "Docker Compose"],
    gifUrl:
      "https://raw.githubusercontent.com/shadeiskndr/shadeiskndr.github.io/main/uploads/todolist.gif",
  },
  {
    name: "EduCafe Booking",
    description:
      "EduCafe Booking is a school cafeteria service web-app that allows students to order their meals remotely, enables staff to manage food bookings, and improves the manager’s workflow. Developed using JSP, Servlets, and Tailwind CSS for the UI, implemented business logic with Enterprise Java Beans (EJBs) from Java EE, and integrated a MySQL database for data storage. This is a university project for the ISB37804 Reuse and Component Based Development class.",
    url: "https://github.com/shadeiskndr/EduCafe-Booking",
    previewImage: ProjectEduCafe,
    technologies: ["Java", "Java EE", "MySQL", "Tailwind CSS", "JSP", "Servlet"],
    gifUrl:
      "https://raw.githubusercontent.com/shadeiskndr/shadeiskndr.github.io/main/uploads/EduCafe%20Demo.gif",
  },
  {
    name: "PHP Starter",
    description:
      "A full-stack web application to show my past PHP university projects for Internet Programming class. Projects include: vehicle rental management system, my movies, cars database & fun calculators.",
    url: "https://github.com/shadeiskndr/PHP-Docker-WebApps",
    previewImage: ProjectPHPDocker,
    technologies: [
      "Vanilla PHP",
      "Apache Web",
      "MySQL",
      "Tailwind CSS",
      "Linux (Ubuntu VM)",
      "DigitalOcean",
      "Docker",
    ],
  },
  {
    name: "Shahathir.me",
    description:
      "A portfolio website created to showcase information about me, my technical skills, the projects that I have done and my experiences. Used various NextJS UI libraries to make the website beautiful.",
    url: "https://shahathir.me",
    previewImage: ProjectShahathirme,
    technologies: ["Next.js", "React", "Typescript", "Tailwind CSS"],
  },
];

export const TESTIMONIALS: TestimonialDetails[] = [
  {
    personName: "Krisztian Gyuris",
    personAvatar: AvatarKrisztian,
    title: "Founder - inboxgenie.io",
    testimonial:
      "Job well done! I am really impressed. He is very very good at what he does:) I would recommend Sagar and will rehire in the future for Frontend development.",
  },
  {
    personName: "Eugen Esanu",
    personAvatar: AvatarEugen,
    title: "Founder - shosho.design",
    testimonial:
      "Great guy, highly recommended for any COMPLEX front-end development job! His skills are top-notch and he will be an amazing addition to any team.",
  },
  {
    personName: "Joe Matkin",
    personAvatar: AvatarDummy,
    title: "Freelancer",
    testimonial:
      "Sagar was extremely easy and pleasant to work with and he truly cares about the project being a success. Sagar has a high level of knowledge and was able to work on my MERN stack application without any issues.",
  },
];

export const CERTIFICATES: CertificateDetails[] = [
  {
    certificateName: "Google Project Management Professional Certificate",
    certificateImage: CertificateGPM,
    certificateSource: "Coursera",
    certificateDescription:
      " Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/8L4C2AHPPWMP",
  },
  {
    certificateName: "Google IT Automation with Python Professional Certificate",
    certificateImage: CertificateITAP,
    certificateSource: "Coursera",
    certificateDescription:
      " Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWQAJCAQAYY2",
  },
  {
    certificateName: "Google IT Support Professional Certificate",
    certificateImage: CertificateITS,
    certificateSource: "Coursera",
    certificateDescription:
      " Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/SF3NTQPRQZLB",
  },
  {
    certificateName: "Google Cybersecurity Professional Certificate",
    certificateImage: CertificateSEC,
    certificateSource: "Coursera",
    certificateDescription:
      " Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWPRBNTZCGKK",
  },
  {
    certificateName: "Google UX Design Professional Certificate",
    certificateImage: CertificateUXD,
    certificateSource: "Coursera",
    certificateDescription:
      " Acquired an understanding of the practices and skills essential for an entry-level project management role, including the creation of effective project documentation and artifacts throughout various project phases. Gained foundational knowledge of Agile project management, with a focus on understanding Scrum roles and events. Further honed strategic communication, problem-solving, and stakeholder management skills through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/JD7XZR37DJSU",
  },
];
