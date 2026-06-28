import PortfolioShell from "@/components/new-site/layout/portfolio-shell";
import { SidebarCollapseProvider } from "@/components/new-site/layout/sidebar-collapse-provider";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarCollapseProvider>
      <PortfolioShell>{children}</PortfolioShell>
    </SidebarCollapseProvider>
  );
}
