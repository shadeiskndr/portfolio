import { Mail } from "lucide-react";
import { GithubIcon } from "@/components/icons/lucide-github";
import { LinkedinIcon } from "@/components/icons/lucide-linkedin";
import { WhatsappIcon } from "@/components/icons/simple-icons-whatsapp";
import type {
  CertificateDetails,
  ExperienceDetails,
  ProjectDetails,
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
    icon: GithubIcon,
    url: "https://github.com/shadeiskndr",
  },
  {
    icon: LinkedinIcon,
    url: "https://www.linkedin.com/in/shahathir-iskandar-b60869270/",
  },
  {
    icon: Mail,
    url: "mailto:shahathiriskandar43@gmail.com",
  },
  {
    icon: WhatsappIcon,
    url: "https://wa.me/601153787564",
  },
];

export const EXPERIENCES: ExperienceDetails[] = [
  {
    logoKey: "logo-frg",
    darkLogoKey: "logo-frg-dark",
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
    logoKey: "logo-estee",
    darkLogoKey: "logo-estee-dark",
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
    attachedFileKey: "internship-estee",
  },
  {
    logoKey: "logo-99",
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
    previewImageKey: "project-catalogd",
    technologies: ["Next.js", "Typescript", "React.js", "Appwrite", "Tailwind CSS"],
  },
  {
    name: "AI Game Recommender",
    description:
      "A web application that leverages AI through vector embedding to provide personalized video game recommendations through prompts & vector search. Over 20,000 video game titles recognized for vector search recommendations integrated into Catalogd. Integrated Open AI text-embed model with DataStax to calculate vector embedding for each video game title data.",
    url: "https://ai-game-recommender.shahathir.me",
    previewImageKey: "project-aigamerecommender",
    technologies: ["Next.js", "Typescript", "Tailwind CSS", "DataStax", "Open AI Text-Embed Model"],
  },
  {
    name: "Country Economic Indicator Analytics Dashboard",
    description:
      "A full-stack web application that serves to provide access and visualise various economic indicators of a specific country, including: GDP growth rates, population growth rates, education expenditure percentages, inflation rates and labour force statistics.",
    url: "https://github.com/shadeiskndr/tgp-challenge-api",
    previewImageKey: "project-countryeconomic",
    technologies: ["Spring Boot", "Java", "React.js", "TypeScript", "MySQL", "Material-UI", "JWT"],
  },
  {
    name: "Todo List",
    description:
      "Built a full-stack to-do list web application for users to keep track of their daily tasks. Demonstrates integration between legacy COBOL systems, a modern Express.js API, and an Angular frontend. Utilized Docker Compose and Dockerfiles to simulate a legacy backend using GnuCOBOL docker image.",
    url: "https://github.com/shadeiskndr/cobol-express-angular-crud",
    previewImageKey: "project-todolist",
    technologies: ["COBOL", "Angular", "Express.js", "Node.js", "Docker Compose"],
  },
  {
    name: "EduCafe Booking",
    description:
      "EduCafe Booking is a school cafeteria service web-app that allows students to order their meals remotely, enables staff to manage food bookings, and improves the manager’s workflow. Developed using JSP, Servlets, and Tailwind CSS for the UI, implemented business logic with Enterprise Java Beans (EJBs) from Java EE, and integrated a MySQL database for data storage. This is a university project for the ISB37804 Reuse and Component Based Development class.",
    url: "https://github.com/shadeiskndr/EduCafe-Booking",
    previewImageKey: "project-educafe",
    technologies: ["Java", "Java EE", "MySQL", "Tailwind CSS", "JSP", "Servlet"],
  },
  {
    name: "PHP Starter",
    description:
      "A full-stack web application to show my past PHP university projects for Internet Programming class. Projects include: vehicle rental management system, my movies, cars database & fun calculators.",
    url: "https://github.com/shadeiskndr/PHP-Docker-WebApps",
    previewImageKey: "project-phpdocker",
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
    previewImageKey: "project-shahathirme",
    technologies: ["Next.js", "React", "Typescript", "Tailwind CSS"],
  },
];

export const TESTIMONIALS: TestimonialDetails[] = [
  {
    personName: "Krisztian Gyuris",
    title: "Founder - inboxgenie.io",
    testimonial:
      "Job well done! I am really impressed. He is very very good at what he does:) I would recommend Sagar and will rehire in the future for Frontend development.",
  },
  {
    personName: "Eugen Esanu",
    title: "Founder - shosho.design",
    testimonial:
      "Great guy, highly recommended for any COMPLEX front-end development job! His skills are top-notch and he will be an amazing addition to any team.",
  },
  {
    personName: "Joe Matkin",
    title: "Freelancer",
    testimonial:
      "Sagar was extremely easy and pleasant to work with and he truly cares about the project being a success. Sagar has a high level of knowledge and was able to work on my MERN stack application without any issues.",
  },
];

export const CERTIFICATES: CertificateDetails[] = [
  {
    certificateName: "Google Project Management Professional Certificate",
    certificateImageKey: "cert-logo-google-pm",
    certificateSource: "Coursera",
    certificateDescription:
      "Gained a foundation in project management across the full project life cycle — initiation, planning, execution, and closure. Covered both traditional (Waterfall) and Agile approaches, including Scrum roles, events, and artifacts. Practiced creating project documentation, managing budgets and risks, and applying strategic communication and stakeholder management through real-world scenarios.",
    url: "https://www.coursera.org/account/accomplishments/specialization/8L4C2AHPPWMP",
  },
  {
    certificateName: "Google IT Automation with Python Professional Certificate",
    certificateImageKey: "cert-logo-google-automation",
    certificateSource: "Coursera",
    certificateDescription:
      "Learned to write Python scripts that automate common system administration and IT tasks. Covered Python fundamentals, using Git and GitHub for version control, and automating work at scale with configuration management and the cloud. Practiced troubleshooting and debugging, and interacting with web services through APIs.",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWQAJCAQAYY2",
  },
  {
    certificateName: "Google IT Support Professional Certificate",
    certificateImageKey: "cert-logo-google-support",
    certificateSource: "Coursera",
    certificateDescription:
      "Built a foundation in entry-level IT support, covering computer networking, operating systems, system administration, and IT infrastructure services. Learned to troubleshoot and resolve technical problems, provide end-user customer support, and apply security best practices to protect systems and data.",
    url: "https://www.coursera.org/account/accomplishments/specialization/SF3NTQPRQZLB",
  },
  {
    certificateName: "Google Cybersecurity Professional Certificate",
    certificateImageKey: "cert-logo-google-cyber",
    certificateSource: "Coursera",
    certificateDescription:
      "Developed foundational cybersecurity skills, including identifying and mitigating threats, risks, and vulnerabilities and applying security frameworks and controls. Covered network security, Linux and SQL, and using SIEM tools and intrusion detection systems to detect and respond to incidents, plus automating security tasks with Python.",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWPRBNTZCGKK",
  },
  {
    certificateName: "Google UX Design Professional Certificate",
    certificateImageKey: "cert-logo-google-ux",
    certificateSource: "Coursera",
    certificateDescription:
      "Learned the end-to-end UX design process — empathizing with users, defining pain points, ideating solutions, and creating wireframes and prototypes. Practiced building low- and high-fidelity prototypes in Figma and Adobe XD, conducting usability studies, applying feedback, and designing responsive websites for multiple screen sizes.",
    url: "https://www.coursera.org/account/accomplishments/specialization/JD7XZR37DJSU",
  },
];
