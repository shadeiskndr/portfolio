import type { Metadata } from "next";
import {
  Caveat,
  DM_Sans,
  Fraunces,
  Geist,
  Inter,
  JetBrains_Mono,
  Lora,
  Plus_Jakarta_Sans,
  Roboto_Mono,
  Source_Serif_4,
} from "next/font/google";
import Script from "next/script";

import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColorThemeProvider } from "@/lib/color-provider";
import { ConvexClientProvider } from "@/lib/convex-client-provider";
import { Providers } from "@/lib/light-dark-providers";
import { QueryProvider } from "@/lib/query-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const title = "Shahathir Iskandar | Software Developer From Batu Caves, Selangor, Malaysia.";
const description = "A software developer from Batu Caves, Selangor, Malaysia.";
const url = "https://shahathir.me";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  keywords: [
    "Web Developer",
    "Mobile Developer",
    "Front-end Developer",
    "Full-stack Developer",
    "Next.js Developer",
    "React Developer",
    "Java Developer",
  ],
  creator: "Shahathir Iskandar",
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: title,
    images: [
      {
        url: "/images/open-graph-shahathir.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@shadeiskndr",
    images: "/images/open-graph-shahathir.jpg",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        "scroll-smooth!",
        plusJakartaSans.variable,
        lora.variable,
        robotoMono.variable,
        geist.variable,
        sourceSerif.variable,
        jetbrainsMono.variable,
        dmSans.variable,
        fraunces.variable,
        caveat.variable,
        "font-sans",
        inter.variable
      )}
      suppressHydrationWarning
    >
      {googleAnalyticsId ? (
        <head>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          ></Script>
          <Script id="google-anayltics-script">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', '${googleAnalyticsId}');
          `}
          </Script>
        </head>
      ) : null}
      <body className="antialiased">
        <ConvexClientProvider>
          <QueryProvider>
            <ColorThemeProvider defaultTheme="default" storageKey="app-color-theme">
              <Providers>
                <TooltipProvider>{children}</TooltipProvider>
              </Providers>
            </ColorThemeProvider>
          </QueryProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
