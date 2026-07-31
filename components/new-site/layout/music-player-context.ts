"use client";

import { createContext, useContext } from "react";

export type Track = { src: string; title: string; artist: string; cover: string | null };

export type MusicPlayerApi = {
  playlist: Track[];
  currentTrack: Track | undefined;
  coverArt: string;
  trackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  hoverTime: number;
  volume: number;
  isMuted: boolean;
  setHoverTime: (value: number) => void;
  scrub: (pct: number) => void;
  commitScrub: (pct: number) => void;
  togglePlay: () => void;
  prevTrack: () => void;
  nextTrack: () => void;
  selectTrack: (index: number) => void;
  applyVolume: (value: number) => void;
};

export const MusicPlayerContext = createContext<MusicPlayerApi | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("`useMusicPlayer` must be used within `MusicPlayerProvider`");
  }
  return ctx;
}
