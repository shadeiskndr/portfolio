import type * as React from "react";
import { FileText, Mail } from "lucide-react";
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
  tagline: "professionally distracted",
  taglineSuffixes: [
    "software developer",
    "tinkerer",
    "problem solver",
    "pixel pusher",
    "gamer",
  ],
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
  { label: "Steam", icon: SteamIcon, url: "https://steamcommunity.com/profiles/76561198339110953/" },
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