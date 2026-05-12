import Sidebar from "@/components/new-site/layout/sidebar";
import TopNav from "@/components/new-site/layout/top-nav";

export default function NewSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r bg-background/50 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Sidebar />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col">
        <TopNav />
        <main className="flex-1 px-6 py-10 lg:px-12 lg:py-14">{children}</main>
      </div>
    </div>
  );
}
