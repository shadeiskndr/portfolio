import Sidebar from "@/components/new-site/layout/sidebar";
import TopNav from "@/components/new-site/layout/top-nav";

export default function NewSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[320px_1fr]">
      <div className="hidden border-r bg-background/50 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1 px-6 py-10 lg:px-12 lg:py-14">{children}</main>
      </div>
    </div>
  );
}
