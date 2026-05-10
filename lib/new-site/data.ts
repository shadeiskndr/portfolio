import {
  FileText,
  Github,
  Instagram,
  Linkedin,
  type LucideIcon,
  Mail,
  MessageCircle,
  Twitter,
} from "lucide-react";

export type SocialLink = { label: string; icon: LucideIcon; url: string };
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

export const PERSONAL = {
  name: "Shahathir",
  emoji: "(•◡•)",
  age: 24,
  location: "Batu Caves, Selangor, Malaysia",
  flag: "🇲🇾",
  status: "shipping pixel-perfect UIs",
  tagline: "your friendly neighbourhood",
  taglineSuffix: "developer",
  avatar: "/images/shahathir-headshot-transparent.png",
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", icon: Github, url: "https://github.com/shadeiskndr" },
  { label: "Twitter", icon: Twitter, url: "https://twitter.com/shadeiskndr" },
  {
    label: "LinkedIn",
    icon: Linkedin,
    url: "https://www.linkedin.com/in/shahathir-iskandar-b60869270/",
  },
  { label: "Instagram", icon: Instagram, url: "https://instagram.com/shadeiskndr" },
  { label: "Email", icon: Mail, url: "mailto:shahathiriskandar43@gmail.com" },
  { label: "WhatsApp", icon: MessageCircle, url: "https://wa.me/601153787564" },
  { label: "Resume", icon: FileText, url: "/files/Resume_ShahathirIskandar.pdf" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/new" },
  { label: "Thoughts", href: "/new/thoughts" },
  { label: "TIL", href: "/new/til" },
  { label: "Bookmarks", href: "/new/bookmarks" },
  { label: "Readings", href: "/new/readings" },
  { label: "Projects", href: "/new/projects" },
  { label: "Accolades", href: "/new/accolades" },
  { label: "Photography", href: "/new/photography" },
  { label: "Songs", href: "/new/songs" },
  { label: "Uses", href: "/new/uses" },
  { label: "Networks", href: "/new/networks" },
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

export const TOOLS: Tool[] = [
  {
    label: "TypeScript",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    label: "React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    label: "Next.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
  {
    label: "Tailwind",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  },
  {
    label: "Node.js",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    label: "PostgreSQL",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  {
    label: "Docker",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  { label: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  {
    label: "Figma",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    label: "VS Code",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  },
  {
    label: "Python",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    label: "Java",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
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
