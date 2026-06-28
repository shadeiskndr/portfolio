import type { Metadata } from "next";
import Footer from "@/components/old-portfolio/layout/footer";
import Header from "@/components/old-portfolio/layout/header";

// The old portfolio stays reachable but must not compete with the new site in
// search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OldPortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col">{children}</main>
      <Footer />
    </>
  );
}
