"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { SpotifyIcon } from "@/components/icons/simple-icons-spotify";
import { MusicPlayer } from "@/components/ui/componentry/music-player";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { TimeRange } from "@/convex/topTracks";
import { SpotifyEmbedProvider, useSpotifyEmbed } from "./spotify-embed-player";

const TAB_META: { value: TimeRange; label: string; blurb: string }[] = [
  { value: "short_term", label: "Last 4 weeks", blurb: "What's on repeat right now." },
  { value: "medium_term", label: "Last 6 months", blurb: "The steady rotation." },
  { value: "long_term", label: "All time", blurb: "The ones that actually stuck." },
];

const DISC_SIZE = "h-28 w-28 sm:h-32 sm:w-32";

function formatDuration(ms: number) {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function TopTracksGrid() {
  return (
    <SpotifyEmbedProvider>
      <Tabs className="gap-6" defaultValue="short_term">
        <TabsList className="h-9">
          {TAB_META.map((t) => (
            <TabsTrigger className="px-3 text-xs sm:text-sm" key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_META.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <p className="mb-6 text-muted-foreground text-sm">{t.blurb}</p>
            <TrackGrid timeRange={t.value} />
          </TabsContent>
        ))}
      </Tabs>

      {/* The Developer Terms require Spotify content to be attributed. */}
      <a
        className="mt-10 inline-flex items-center gap-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
        href="https://spotify.com"
        rel="noreferrer"
        target="_blank"
      >
        <SpotifyIcon className="h-4 w-4 text-[#1DB954]" />
        Listening data and playback provided by Spotify
      </a>
    </SpotifyEmbedProvider>
  );
}

type Track = FunctionReturnType<typeof api.topTracks.list>[number];

function TrackDisc({ track }: { track: Track }) {
  const { activeTrackId, isPaused, toggle } = useSpotifyEmbed();
  const isActive = activeTrackId === track.trackId;
  const isPlaying = isActive && !isPaused;

  return (
    <li className="flex flex-col items-center gap-3 text-center">
      <button
        aria-label={`${isPlaying ? "Pause" : "Play"} ${track.song} by ${track.artist}`}
        aria-pressed={isPlaying}
        className="group relative cursor-pointer rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => toggle(track.trackId)}
        type="button"
      >
        <MusicPlayer
          coverArt={track.albumArtUrl ?? ""}
          discClassName={DISC_SIZE}
          hideTonearm
          // Controlled: the disc mirrors real embed playback rather than a
          // local guess, so it stops spinning when Spotify actually pauses.
          isPlaying={isPlaying}
        />
        <span className="absolute -top-1 -left-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background font-medium text-[11px] text-muted-foreground tabular-nums shadow-sm">
          {track.rank + 1}
        </span>
      </button>

      <div className="w-full min-w-0 space-y-0.5">
        <a
          className="block truncate rounded font-medium text-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          href={track.url}
          rel="noreferrer"
          target="_blank"
          title={`${track.song} — open on Spotify`}
        >
          {track.song}
        </a>
        <p className="truncate text-muted-foreground text-xs" title={track.artist}>
          {track.artist}
        </p>
        <p className="text-[11px] text-muted-foreground/70 tabular-nums">
          {formatDuration(track.durationMs)}
          {track.releaseDate ? ` · ${track.releaseDate.slice(0, 4)}` : ""}
        </p>
      </div>
    </li>
  );
}

function TrackGrid({ timeRange }: { timeRange: TimeRange }) {
  const tracks = useQuery(api.topTracks.list, { timeRange });

  if (tracks === undefined) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="flex flex-col items-center gap-3" key={i}>
            <Skeleton className={`${DISC_SIZE} rounded-full`} />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    // Deliberately vague: this renders publicly. The actionable diagnosis (403
    // scope vs 429 quota) is in the `refreshTopTracks` error and Convex logs.
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nothing on the turntable right now — check back soon.
        </p>
      </div>
    );
  }

  return (
    // The disc component hardcodes `animate-spin`, so opt the whole grid out of
    // motion in one place rather than per-disc.
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 motion-reduce:[&_*]:animate-none">
      {tracks.map((track) => (
        <TrackDisc key={track._id} track={track} />
      ))}
    </ul>
  );
}
