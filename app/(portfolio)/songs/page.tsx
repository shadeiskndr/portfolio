import PageHeader from "@/components/new-site/content/page-header";
import TopTracksGrid from "@/components/new-site/data-display/top-tracks-grid";

export const metadata = {
  title: "Songs",
  description: "Tracks I keep coming back to, straight from my Spotify listening history.",
};

export default function SongsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        description="Tracks I keep coming back to, straight from my Spotify listening history. Updated daily."
        title="Songs"
      />
      <TopTracksGrid />
    </div>
  );
}
