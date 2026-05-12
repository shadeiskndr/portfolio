import AvatarCard from "@/components/new-site/data-display/avatar-card";
import CareerTimeline from "@/components/new-site/data-display/career-timeline";
import QuoteCard from "@/components/new-site/data-display/quote-card";
import SocialRow from "@/components/new-site/data-display/social-row";
import SpotifyCard from "@/components/new-site/data-display/spotify-card";
import ToolsGrid from "@/components/new-site/data-display/tools-grid";

export default function Sidebar() {
  return (
    <aside className="flex min-h-full flex-col gap-5 p-5">
      <AvatarCard />
      <SocialRow />
      <CareerTimeline />
      <ToolsGrid />
      <QuoteCard />
      <div className="mt-auto space-y-3 pt-4">
        <SpotifyCard />
        <Footer />
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="space-y-1 text-center">
      <p className="text-muted-foreground text-xs">{new Date().getFullYear()} © shahathir.me</p>
      <p className="text-muted-foreground/70 text-xs">
        <a href="/new/changelog" className="hover:text-foreground">
          Changelogs
        </a>
        {" · "}
        <a href="/old" className="hover:text-foreground">
          Old site
        </a>
      </p>
    </footer>
  );
}
