import {
  BarChart3,
  FileCode,
  FileText,
  Gamepad2,
  Globe,
  ListChecks,
  type LucideIcon,
  Mail,
  Sparkles,
  Utensils,
} from "lucide-react";
import type * as React from "react";
import { GithubIcon } from "@/components/icons/lucide-github";
import { InstagramIcon } from "@/components/icons/lucide-instagram";
import { LinkedinIcon } from "@/components/icons/lucide-linkedin";
import { TwitterIcon } from "@/components/icons/lucide-twitter";
import { PlaystationIcon } from "@/components/icons/simple-icons-playstation";
import { SpotifyIcon } from "@/components/icons/simple-icons-spotify";
import { SteamIcon } from "@/components/icons/simple-icons-steam";
import { ThreadsIcon } from "@/components/icons/simple-icons-threads";
import { WhatsappIcon } from "@/components/icons/simple-icons-whatsapp";

export type SocialIcon = React.ComponentType<{ className?: string }>;
export type SocialLink = { label: string; icon: SocialIcon; url: string };
export type NavLink = { label: string; href: string };
export type CareerEntry = {
  company: string;
  logoKey: string;
  darkLogoKey?: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
};
export type ExperienceEntry = CareerEntry & {
  logoAlt: string;
  summary: string[];
  attachedFileKey?: string;
};
export type Tool = { label: string; logoKey: string };
export type Quote = { text: string; author?: string };
export type Project = {
  title: string;
  description: string;
  url: string;
  technologies: string[];
  icon: LucideIcon;
  color: string;
  imageKey: string;
};
export type IdeaColor = "yellow" | "pink" | "blue" | "green";
export type Idea = {
  id: string;
  title: string;
  body?: string;
  author?: string;
  color?: IdeaColor;
  rotation?: number;
  position: { x: number; y: number };
};
export type IdeaConnection = { from: string; to: string };

export const PERSONAL = {
  name: "Shahathir",
  emoji: "(•◡•)",
  age: 24,
  location: "Batu Caves, Selangor, Malaysia",
  flag: "🇲🇾",
  tagline: "professionally distracted",
  taglineSuffixes: ["software developer", "tinkerer", "problem solver", "pixel pusher", "gamer"],
  avatarKey: "avatar",
  avatarAltKey: "avatar-alt",
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", icon: GithubIcon, url: "https://github.com/shadeiskndr" },
  { label: "Twitter", icon: TwitterIcon, url: "https://twitter.com/shadeiskndr" },
  {
    label: "LinkedIn",
    icon: LinkedinIcon,
    url: "https://www.linkedin.com/in/shahathir-iskandar-b60869270/",
  },
  { label: "Instagram", icon: InstagramIcon, url: "https://instagram.com/shadeiskndr" },
  { label: "Threads", icon: ThreadsIcon, url: "https://threads.net/@shadeiskndr" },
  {
    label: "Spotify",
    icon: SpotifyIcon,
    url: "https://open.spotify.com/user/cw4uqrox0encxaij8fce4176p",
  },
  {
    label: "Steam",
    icon: SteamIcon,
    url: "https://steamcommunity.com/profiles/76561198339110953/",
  },
  {
    label: "PlayStation",
    icon: PlaystationIcon,
    url: "https://profile.playstation.com/ShadeIs_28",
  },
  { label: "Email", icon: Mail, url: "mailto:shahathiriskandar43@gmail.com" },
  { label: "WhatsApp", icon: WhatsappIcon, url: "https://wa.me/601153787564" },
  // `url` is unused: SocialRow renders this entry as a <ResumeDialog> trigger
  // (the PDF is resolved from the assets table via the "resume" key).
  { label: "Resume", icon: FileText, url: "#" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/" },
  { label: "Thoughts", href: "/thoughts" },
  { label: "TIL", href: "/til" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Accolades", href: "/accolades" },
  { label: "Photography", href: "/photography" },
  { label: "Songs", href: "/songs" },
  { label: "Uses", href: "/uses" },
  { label: "Networks", href: "/networks" },
];

export const CAREER_TIMELINE: CareerEntry[] = [
  {
    company: "Financial Risk Group",
    logoKey: "logo-frg",
    darkLogoKey: "logo-frg-dark",
    position: "Assistant Software Developer",
    startDate: new Date(2025, 5),
    current: true,
  },
  {
    company: "Estee Lauder Companies",
    logoKey: "logo-estee",
    darkLogoKey: "logo-estee-dark",
    position: "Software Engineer Intern",
    startDate: new Date(2024, 8),
    endDate: new Date(2025, 2),
  },
];

export const EXPERIENCES: ExperienceEntry[] = [
  {
    company: "Financial Risk Group",
    logoKey: "logo-frg",
    darkLogoKey: "logo-frg-dark",
    logoAlt: "Financial Risk Group logo",
    position: "Assistant Software Developer",
    startDate: new Date(2025, 5),
    current: true,
    summary: [
      "Contributing to the development and maintenance of Financial Risk Group's Visualization of Risk (VOR) product and other internal tooling.",
      "Developed an internal AI agent web application from scratch to improve the onboarding of financial portfolio data for the business analytics team, using technologies such as React.js, Django, PostgreSQL, Strands Agents SDK, AWS Bedrock, Docker Compose.",
      "Performing root cause analysis and investigation for bug fixes.",
      "Creating detailed pull requests that includes summary, problem statement, solution and reviewer test plans to reduce technical debt and improve code documentation.",
      "Assisting with code reviews and testing to ensure high-quality software delivery.",
    ],
  },
  {
    company: "The Estée Lauder Companies",
    logoKey: "logo-estee",
    darkLogoKey: "logo-estee-dark",
    logoAlt: "The Estée Lauder Companies logo",
    position: "Software Engineer Intern",
    startDate: new Date(2024, 9),
    endDate: new Date(2025, 1),
    summary: [
      "Contributed significantly to the development and delivery of an internal Support Portal full-stack web application to support Estée Lauder Companies' retail operations.",
      "Gained hands-on experience with retail software architecture and best practices in a production environment.",
      "Assisted in troubleshooting and resolving critical issues to ensure smooth operations for retail clients.",
      "Participated in code reviews and implemented improvements to enhance system performance and reliability.",
    ],
    attachedFileKey: "internship-estee",
  },
  {
    company: "99 Speedmart",
    logoKey: "logo-99",
    logoAlt: "99 Speedmart logo",
    position: "Logistics Associate",
    startDate: new Date(2020, 1),
    endDate: new Date(2020, 5),
    summary: [
      "Coordinated with the store manager to restock inventory as needed, performed regular stock checks and reported any issues to the store manager immediately.",
      "Organized the store area for ease of access and optimal space utilization.",
    ],
  },
];

// Consolidated tools & skills (union of the old-site categorized skills and the
// previous CDN-backed tools list). Logos are local; resolved to Convex keys later.
export const TOOLS: Tool[] = [
  { label: "TypeScript", logoKey: "tool-typescript" },
  { label: "JavaScript", logoKey: "tool-javascript" },
  { label: "Java", logoKey: "tool-java" },
  { label: "Python", logoKey: "tool-python" },
  { label: "PHP", logoKey: "tool-php" },
  { label: "Go", logoKey: "tool-go" },
  { label: "HTML5", logoKey: "tool-html" },
  { label: "CSS3", logoKey: "tool-css" },
  { label: "React", logoKey: "tool-react" },
  { label: "Next.js", logoKey: "tool-nextjs" },
  { label: "Vite", logoKey: "tool-vite" },
  { label: "Angular", logoKey: "tool-angular" },
  { label: "Redux", logoKey: "tool-redux" },
  { label: "React Router", logoKey: "tool-reactrouter" },
  { label: "Tailwind CSS", logoKey: "tool-tailwind" },
  { label: "shadcn/ui", logoKey: "tool-shadcn" },
  { label: "Material UI", logoKey: "tool-mui" },
  { label: "Sass", logoKey: "tool-sass" },
  { label: "Bootstrap", logoKey: "tool-bootstrap" },
  { label: "React Native", logoKey: "tool-reactnative" },
  { label: "Node.js", logoKey: "tool-nodejs" },
  { label: "Bun", logoKey: "tool-bun" },
  { label: "Django", logoKey: "tool-django" },
  { label: "FastAPI", logoKey: "tool-fastapi" },
  { label: "Spring Boot", logoKey: "tool-springboot" },
  { label: "Java Servlets", logoKey: "tool-jakarta" },
  { label: "Express", logoKey: "tool-express" },
  { label: "PostgreSQL", logoKey: "tool-postgres" },
  { label: "MySQL", logoKey: "tool-mysql" },
  { label: "MS SQL Server", logoKey: "tool-mssql" },
  { label: "SQLite", logoKey: "tool-sqlite" },
  { label: "Appwrite", logoKey: "tool-appwrite" },
  { label: "Docker", logoKey: "tool-docker" },
  { label: "AWS", logoKey: "tool-aws" },
  { label: "Cloudflare", logoKey: "tool-cloudflare" },
  { label: "Nginx", logoKey: "tool-nginx" },
  { label: "Vercel", logoKey: "tool-vercel" },
  { label: "Netlify", logoKey: "tool-netlify" },
  { label: "DigitalOcean", logoKey: "tool-digitalocean" },
  { label: "Git", logoKey: "tool-git" },
  { label: "DBeaver", logoKey: "tool-dbeaver" },
  { label: "Postman", logoKey: "tool-postman" },
];

export const QUOTES: Quote[] = [
  {
    text: "There isn't time, so brief is life, for bickerings, apologies, heartburnings, callings to account.",
    author: "Mark Twain",
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
];

export const IDEAS: Idea[] = [
  {
    id: "1",
    title: "Ship the slower version.",
    body: "Half-finished essays, things learned this week, projects that may or may not ship.",
    color: "yellow",
    rotation: -4,
    position: { x: 40, y: 20 },
  },
  {
    id: "2",
    title: "Care about the small stuff.",
    body: "Spacing, hit targets, the way a page feels to navigate.",
    color: "pink",
    rotation: 3,
    position: { x: 360, y: 140 },
  },
  {
    id: "3",
    title: "Break things in public.",
    body: "Build, ship, watch the parts you got wrong embarrass you later.",
    color: "blue",
    rotation: -2,
    position: { x: 80, y: 320 },
  },
  {
    id: "4",
    title: "Not everything has to be polished.",
    body: "That's sort of the point.",
    author: "me, probably",
    color: "green",
    rotation: 2,
    position: { x: 420, y: 380 },
  },
];

export const IDEA_CONNECTIONS: IdeaConnection[] = [
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
];

export const PROJECTS: Project[] = [
  {
    title: "Catalogd",
    description:
      "Social cataloging app for video game enthusiasts — log plays, write reviews, discover titles, connect with others. Final-year project for my Bachelor's.",
    url: "https://catalogd.shahathir.me",
    technologies: ["Next.js", "TypeScript", "Appwrite", "Tailwind CSS"],
    icon: Gamepad2,
    color: "#a78bfa",
    imageKey: "project-catalogd",
  },
  {
    title: "shahathir.me",
    description:
      "This site. Portfolio + slow-blog hybrid. The version you're looking at is a ground-up rewrite — see the changelog for the gory details.",
    url: "https://shahathir.me",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Convex"],
    icon: Globe,
    color: "#38bdf8",
    imageKey: "project-shahathirme",
  },
  {
    title: "AI Game Recommender",
    description:
      "Personalised game recommendations via vector search. 20,000+ titles embedded with OpenAI; queried through DataStax. Wired into Catalogd.",
    url: "https://ai-game-recommender.shahathir.me",
    technologies: ["Next.js", "TypeScript", "DataStax", "OpenAI Embeddings"],
    icon: Sparkles,
    color: "#f472b6",
    imageKey: "project-aigamerecommender",
  },
  {
    title: "Country Economic Dashboard",
    description:
      "Full-stack dashboard for visualising country-level economic indicators — GDP, inflation, labour force, education spend.",
    url: "https://github.com/shadeiskndr/tgp-challenge-api",
    technologies: ["Spring Boot", "Java", "React", "TypeScript", "MySQL", "JWT"],
    icon: BarChart3,
    color: "#34d399",
    imageKey: "project-countryeconomic",
  },
  {
    title: "PHP Starter",
    description:
      "Collection of PHP coursework — vehicle rental system, movie database, fun calculators — packaged with Apache + MySQL via Docker.",
    url: "https://github.com/shadeiskndr/PHP-Docker-WebApps",
    technologies: ["PHP", "Apache", "MySQL", "Docker", "Tailwind CSS"],
    icon: FileCode,
    color: "#22d3ee",
    imageKey: "project-phpdocker",
  },
  {
    title: "COBOL Todo List",
    description:
      "Full-stack todo app demonstrating COBOL ↔ Express ↔ Angular integration. GnuCOBOL backend simulated via Docker Compose.",
    url: "https://github.com/shadeiskndr/cobol-express-angular-crud",
    technologies: ["COBOL", "Angular", "Express", "Node.js", "Docker"],
    icon: ListChecks,
    color: "#60a5fa",
    imageKey: "project-todolist",
  },
  {
    title: "EduCafe Booking",
    description:
      "School cafeteria ordering web app — students order remotely, staff manage bookings. Built with JSP, EJBs, and MySQL for a uni component-based development class.",
    url: "https://github.com/shadeiskndr/EduCafe-Booking",
    technologies: ["Java EE", "JSP", "Servlets", "MySQL", "Tailwind CSS"],
    icon: Utensils,
    color: "#f59e0b",
    imageKey: "project-educafe",
  },
];

export type Certificate = {
  name: string;
  issuer: string;
  description: string;
  /** Asset key for a brand/badge logo for the list + card header. Falls back to `imageKey`. */
  logoKey?: string;
  /** Asset key for the full certificate image shown in the expanded card, if available. */
  imageKey?: string;
  /** Verification / credential URL, if available. */
  url?: string;
};

// Combined from the resume (source of truth for names + descriptions) and the
// old site (which contributes the Coursera certificate images + verify links).
// `image`/`url` are present only where an asset or credential link exists.
export const CERTIFICATES: Certificate[] = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    description:
      "Gained a comprehensive understanding of AWS services and technologies, and the ability to design secure, robust solutions using architectural best practices based on customer requirements.",
    logoKey: "cert-logo-aws",
    imageKey: "cert-aws-saa",
    url: "https://www.credly.com/badges/72b9a211-838b-4fd7-99ba-1c6029206bca",
  },
  {
    name: "Build REST APIs with Django REST Framework and Python",
    issuer: "Udemy",
    description: "Learned to build robust REST APIs in Django using the Django REST Framework.",
    logoKey: "cert-logo-udemy",
    imageKey: "cert-udemy-django",
    url: "https://www.udemy.com/certificate/UC-16a218ea-34f7-4aa5-a081-ee57ab8e8ca6/",
  },
  {
    name: "Go: The Complete Developer's Guide (Golang)",
    issuer: "Udemy",
    description: "Learned the fundamentals of Go and its type-safe syntax.",
    logoKey: "cert-logo-udemy",
    imageKey: "cert-udemy-go",
    url: "https://www.udemy.com/certificate/UC-90d4d6c9-914b-4106-804e-d4396c14e615/",
  },
  {
    name: "Google IT Automation with Python",
    issuer: "Coursera",
    description:
      "Used Python scripting to automate tasks and manage IT resources across physical and cloud-based VMs.",
    logoKey: "cert-logo-google-automation",
    imageKey: "cert-google-automation",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWQAJCAQAYY2",
  },
  {
    name: "Google UX Design",
    issuer: "Coursera",
    description: "Conducted UX research and applied user-centered design principles.",
    logoKey: "cert-logo-google-ux",
    imageKey: "cert-google-ux",
    url: "https://www.coursera.org/account/accomplishments/specialization/JD7XZR37DJSU",
  },
  {
    name: "Google Project Management",
    issuer: "Coursera",
    description:
      "Covered the practices and skills for an entry-level project management role — project documentation across phases, Agile/Scrum fundamentals, and stakeholder management.",
    logoKey: "cert-logo-google-pm",
    imageKey: "cert-google-pm",
    url: "https://www.coursera.org/account/accomplishments/specialization/8L4C2AHPPWMP",
  },
  {
    name: "Google IT Support",
    issuer: "Coursera",
    // TODO(shahathir): confirm wording — rewritten from the old site's placeholder text.
    description:
      "Covered IT support fundamentals — troubleshooting, customer service, networking, operating systems, system administration, and security.",
    logoKey: "cert-logo-google-support",
    imageKey: "cert-google-support",
    url: "https://www.coursera.org/account/accomplishments/specialization/SF3NTQPRQZLB",
  },
  {
    name: "Google Cybersecurity",
    issuer: "Coursera",
    // TODO(shahathir): confirm wording — rewritten from the old site's placeholder text.
    description:
      "Covered cybersecurity fundamentals — security frameworks, network security, Linux, SQL, Python, and threat detection and response.",
    logoKey: "cert-logo-google-cyber",
    imageKey: "cert-google-cyber",
    url: "https://www.coursera.org/account/accomplishments/specialization/KWPRBNTZCGKK",
  },
];

export type Recognition = {
  title: string;
  detail: string;
  meta?: string;
};

// Academic highlights pulled from the resume.
export const RECOGNITIONS: Recognition[] = [
  {
    title: "Bachelor of Information Technology (Hons.) — Software Engineering",
    detail: "CGPA 3.78 / 4.00",
    meta: "Universiti Kuala Lumpur (MIIT)",
  },
  {
    title: "Foundation in Science",
    detail: "CGPA 3.67 / 4.00",
    meta: "Universiti Teknologi MARA",
  },
  {
    title: "Sijil Pelajaran Malaysia (SPM)",
    detail: "3A+, 6A, 1B+",
    meta: "High school certificate",
  },
  {
    title: "Malaysian University English Test (MUET)",
    detail: "Band 4.5",
    meta: "English proficiency",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  /** Public path to an avatar image, if available. */
  avatar?: string;
};

// Intentionally empty: the old site's testimonials were placeholder template
// data. Real quotes from Shahathir go here; the section hides itself when empty.
export const TESTIMONIALS: Testimonial[] = [];
