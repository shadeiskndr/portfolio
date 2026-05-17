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
import type { StaticImageData } from "next/image";
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
import ProjectAIGame from "@/public/images/project-aigamerecommender.jpg";
import ProjectCatalogd from "@/public/images/project-catalogd.png";
import ProjectCountryEconomic from "@/public/images/project-countryeconomicdashboard.png";
import ProjectEduCafe from "@/public/images/project-educafe.jpg";
import ProjectPHPDocker from "@/public/images/project-phpdocker.png";
import ProjectShahathirme from "@/public/images/project-shahathirme.jpg";
import ProjectTodoList from "@/public/images/project-todolist.png";

export type SocialIcon = React.ComponentType<{ className?: string }>;
export type SocialLink = { label: string; icon: SocialIcon; url: string };
export type NavLink = { label: string; href: string };
export type CareerEntry = {
  company: string;
  logo: string;
  darkLogo?: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
};
export type Tool = { label: string; logo: string; url?: string };
export type Quote = { text: string; author?: string };
export type Project = {
  title: string;
  description: string;
  url: string;
  technologies: string[];
  icon: LucideIcon;
  color: string;
  image: StaticImageData;
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
  avatar: "/images/shahathir-headshot-transparent.png",
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
  { label: "Resume", icon: FileText, url: "/files/Resume_ShahathirIskandar.pdf" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/" },
  { label: "Thoughts", href: "/thoughts" },
  { label: "TIL", href: "/til" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Readings", href: "/readings" },
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
    logo: "/images/logos/logo-frg-light.png",
    darkLogo: "/images/logos/logo-frg-dark.png",
    position: "Assistant Software Developer",
    startDate: new Date(2025, 5),
    current: true,
  },
  {
    company: "Estee Lauder Companies",
    logo: "/images/logos/logo-estee.png",
    darkLogo: "/images/logos/logo-estee-dark.png",
    position: "Software Engineer Intern",
    startDate: new Date(2024, 8),
    endDate: new Date(2025, 2),
  },
];

const DEVICON = (name: string, variant = "original") =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-${variant}.svg`;
const SIMPLE = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

export const TOOLS: Tool[] = [
  { label: "TypeScript", logo: DEVICON("typescript") },
  { label: "Python", logo: DEVICON("python") },
  { label: "Java", logo: DEVICON("java") },
  { label: "Go", logo: DEVICON("go") },
  { label: "HTML5", logo: DEVICON("html5") },
  { label: "CSS3", logo: DEVICON("css3") },
  { label: "React", logo: DEVICON("react") },
  { label: "Next.js", logo: DEVICON("nextjs") },
  { label: "Vite", logo: DEVICON("vitejs") },
  { label: "Angular", logo: DEVICON("angular") },
  { label: "Tailwind CSS", logo: DEVICON("tailwindcss") },
  { label: "shadcn/ui", logo: "/icons/shadcn.svg" },
  { label: "Material UI", logo: DEVICON("materialui") },
  { label: "Sass", logo: DEVICON("sass") },
  { label: "Node.js", logo: DEVICON("nodejs") },
  { label: "Bun", logo: DEVICON("bun") },
  { label: "Django", logo: "/icons/django.svg" },
  { label: "FastAPI", logo: DEVICON("fastapi") },
  { label: "Spring Boot", logo: DEVICON("spring") },
  { label: "PostgreSQL", logo: DEVICON("postgresql") },
  { label: "SQLite", logo: DEVICON("sqlite") },
  { label: "AWS", logo: "/icons/aws.svg" },
  { label: "Cloudflare", logo: SIMPLE("cloudflare") },
  { label: "Docker", logo: DEVICON("docker") },
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
    image: ProjectCatalogd,
  },
  {
    title: "shahathir.me",
    description:
      "This site. Portfolio + slow-blog hybrid. The version you're looking at is a ground-up rewrite — see the changelog for the gory details.",
    url: "https://shahathir.me",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Convex"],
    icon: Globe,
    color: "#38bdf8",
    image: ProjectShahathirme,
  },
  {
    title: "AI Game Recommender",
    description:
      "Personalised game recommendations via vector search. 20,000+ titles embedded with OpenAI; queried through DataStax. Wired into Catalogd.",
    url: "https://ai-game-recommender.shahathir.me",
    technologies: ["Next.js", "TypeScript", "DataStax", "OpenAI Embeddings"],
    icon: Sparkles,
    color: "#f472b6",
    image: ProjectAIGame,
  },
  {
    title: "Country Economic Dashboard",
    description:
      "Full-stack dashboard for visualising country-level economic indicators — GDP, inflation, labour force, education spend.",
    url: "https://github.com/shadeiskndr/tgp-challenge-api",
    technologies: ["Spring Boot", "Java", "React", "TypeScript", "MySQL", "JWT"],
    icon: BarChart3,
    color: "#34d399",
    image: ProjectCountryEconomic,
  },
  {
    title: "PHP Starter",
    description:
      "Collection of PHP coursework — vehicle rental system, movie database, fun calculators — packaged with Apache + MySQL via Docker.",
    url: "https://github.com/shadeiskndr/PHP-Docker-WebApps",
    technologies: ["PHP", "Apache", "MySQL", "Docker", "Tailwind CSS"],
    icon: FileCode,
    color: "#22d3ee",
    image: ProjectPHPDocker,
  },
  {
    title: "COBOL Todo List",
    description:
      "Full-stack todo app demonstrating COBOL ↔ Express ↔ Angular integration. GnuCOBOL backend simulated via Docker Compose.",
    url: "https://github.com/shadeiskndr/cobol-express-angular-crud",
    technologies: ["COBOL", "Angular", "Express", "Node.js", "Docker"],
    icon: ListChecks,
    color: "#60a5fa",
    image: ProjectTodoList,
  },
  {
    title: "EduCafe Booking",
    description:
      "School cafeteria ordering web app — students order remotely, staff manage bookings. Built with JSP, EJBs, and MySQL for a uni component-based development class.",
    url: "https://github.com/shadeiskndr/EduCafe-Booking",
    technologies: ["Java EE", "JSP", "Servlets", "MySQL", "Tailwind CSS"],
    icon: Utensils,
    color: "#f59e0b",
    image: ProjectEduCafe,
  },
];
