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
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

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
        {umamiWebsiteId ? (
          <Script
            defer
            src="https://analytics.shahathir.me/script.js"
            data-website-id={umamiWebsiteId}
          />
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
