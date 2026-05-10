import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col">{children}</main>
      <Footer />
    </>
  );
}
