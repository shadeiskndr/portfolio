import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Script from "next/script";

import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { buildThemeCSSText, THEME_VARS_STYLE_ID } from "@/lib/apply-theme-css-vars";
import { AssetsProvider } from "@/lib/assets-provider";
import { ColorThemeProvider } from "@/lib/color-provider";
import { DEFAULT_COLOR_THEME } from "@/lib/color-themes";
import { ConvexClientProvider } from "@/lib/convex-client-provider";
import { Providers } from "@/lib/light-dark-providers";
import { QueryProvider } from "@/lib/query-provider";
import { cn } from "@/lib/utils";

const initialThemeCSS = buildThemeCSSText(DEFAULT_COLOR_THEME);

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
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preloadedAssets = await preloadQuery(api.assets.list, {});
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        "scroll-smooth!",
        geist.variable,
        sourceSerif.variable,
        geistMono.variable,
        caveat.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <head>
        <style
          id={THEME_VARS_STYLE_ID}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Built from typed theme data
          dangerouslySetInnerHTML={{ __html: initialThemeCSS }}
        />
        {googleAnalyticsId ? (
          <>
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
          </>
        ) : null}
      </head>
      <body className="antialiased">
        <ConvexClientProvider>
          <AssetsProvider preloaded={preloadedAssets}>
            <QueryProvider>
              <ColorThemeProvider defaultTheme="default" storageKey="app-color-theme">
                <Providers>
                  <TooltipProvider>{children}</TooltipProvider>
                </Providers>
              </ColorThemeProvider>
            </QueryProvider>
          </AssetsProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
