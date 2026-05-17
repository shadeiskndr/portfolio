import Footer from "@/components/old-portfolio/layout/footer";
import Header from "@/components/old-portfolio/layout/header";

export default function OldPortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col">{children}</main>
      <Footer />
    </>
  );
}
