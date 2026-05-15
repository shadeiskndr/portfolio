"use client";

import { useQuery } from "@tanstack/react-query";

export type SpotifyNowPlaying = {
  isPlaying: boolean;
  track: {
    trackId: string;
    song: string;
    artist: string;
    album: string;
    albumArtUrl: string | null;
    url: string;
  } | null;
  playedAt?: string;
};

async function fetchNowPlaying(): Promise<SpotifyNowPlaying> {
  const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`now-playing ${res.status}`);
  }
  return (await res.json()) as SpotifyNowPlaying;
}

export function useSpotifyNowPlaying(enabled: boolean, refetchIntervalMs = 60_000) {
  return useQuery({
    queryKey: ["spotify-now-playing"],
    queryFn: fetchNowPlaying,
    enabled,
    refetchInterval: refetchIntervalMs,
  });
}
