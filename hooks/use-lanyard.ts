"use client";

import { useQuery } from "@tanstack/react-query";
import { LANYARD } from "@/lib/new-site/data";

export type LanyardSpotify = {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
};

export type LanyardData = {
  discord_status: "online" | "idle" | "dnd" | "offline";
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
};

type LanyardResponse = { success: boolean; data: LanyardData };

async function fetchLanyard(): Promise<LanyardData> {
  const res = await fetch(`${LANYARD.baseUrl}/v1/users/${LANYARD.userId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Lanyard ${res.status}`);
  }
  const json = (await res.json()) as LanyardResponse;
  if (!json.success) {
    throw new Error("Lanyard returned success=false");
  }
  return json.data;
}

export function useLanyard(refetchIntervalMs = 15_000) {
  return useQuery({
    queryKey: ["lanyard", LANYARD.userId],
    queryFn: fetchLanyard,
    refetchInterval: refetchIntervalMs,
  });
}
