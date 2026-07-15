"use client";

import { useQuery } from "convex/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMountEffect } from "@/hooks/use-mount-effect";

export type Track = { src: string; title: string; artist: string; cover: string | null };

function colorCoverUri(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${color}'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK_COVER = colorCoverUri("hsl(0 0% 30%)");

const EMPTY_PLAYLIST: Track[] = [];

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

const MusicPlayerContext = createContext<MusicPlayerApi | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("`useMusicPlayer` must be used within `MusicPlayerProvider`");
  }
  return ctx;
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(10);
  const isMuted = volume === 0;
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false);

  const playlist = useQuery(api.songs.list) ?? EMPTY_PLAYLIST;
  const currentTrack = playlist[trackIndex];
  const coverArt = currentTrack?.cover ?? FALLBACK_COVER;

  useMountEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  });

  const applyVolume = useCallback((v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.max(0, Math.min(duration || 0, time));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration]
  );

  const changeTrack = useCallback(
    (index: number) => {
      if (index === trackIndex) return;
      setTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      wasPlayingRef.current = true;
    },
    [trackIndex]
  );

  const nextTrack = useCallback(
    () => changeTrack((trackIndex + 1) % playlist.length),
    [changeTrack, trackIndex, playlist.length]
  );
  const prevTrack = useCallback(
    () => changeTrack((trackIndex - 1 + playlist.length) % playlist.length),
    [changeTrack, trackIndex, playlist.length]
  );

  const scrub = useCallback(
    (pct: number) => {
      if (!duration) return;
      if (isPlaying) {
        wasPlayingRef.current = true;
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      seek((pct / 100) * duration);
    },
    [duration, isPlaying, seek]
  );

  const commitScrub = useCallback(
    (pct: number) => {
      if (!duration) return;
      seek((pct / 100) * duration);
      if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    },
    [duration, seek]
  );

  const value = useMemo<MusicPlayerApi>(
    () => ({
      playlist,
      currentTrack,
      coverArt,
      trackIndex,
      isPlaying,
      currentTime,
      duration,
      hoverTime,
      volume,
      isMuted,
      setHoverTime,
      scrub,
      commitScrub,
      togglePlay,
      prevTrack,
      nextTrack,
      selectTrack: changeTrack,
      applyVolume,
    }),
    [
      playlist,
      currentTrack,
      coverArt,
      trackIndex,
      isPlaying,
      currentTime,
      duration,
      hoverTime,
      volume,
      isMuted,
      scrub,
      commitScrub,
      togglePlay,
      prevTrack,
      nextTrack,
      changeTrack,
      applyVolume,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {currentTrack ? (
        // biome-ignore lint/a11y/useMediaCaption: background audio player has no caption track
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="auto"
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime);
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
          }}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
            e.currentTarget.volume = volume / 100;
            if (wasPlayingRef.current) {
              wasPlayingRef.current = false;
              e.currentTarget
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          }}
          onDurationChange={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDuration(d);
          }}
          onEnded={() => {
            if (playlist.length > 1) {
              nextTrack();
            } else {
              setIsPlaying(false);
            }
          }}
          className="pointer-events-none fixed h-0 w-0 opacity-0"
        />
      ) : null}
    </MusicPlayerContext.Provider>
  );
}
