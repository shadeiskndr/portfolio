"use client";

import { useQuery } from "convex/react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  type MusicPlayerApi,
  MusicPlayerContext,
  type Track,
} from "@/components/new-site/layout/music-player-context";
import { api } from "@/convex/_generated/api";
import { useMountEffect } from "@/hooks/use-mount-effect";

function colorCoverUri(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${color}'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK_COVER = colorCoverUri("hsl(0 0% 30%)");

const EMPTY_PLAYLIST: Track[] = [];

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

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
    const d = e.currentTarget.duration;
    if (Number.isFinite(d) && d > 0) setDuration(d);
  }, []);

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
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
    },
    [volume]
  );

  const handleDurationChange = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const d = e.currentTarget.duration;
    if (Number.isFinite(d) && d > 0) setDuration(d);
  }, []);

  const handleEnded = useCallback(() => {
    if (playlist.length > 1) {
      nextTrack();
    } else {
      setIsPlaying(false);
    }
  }, [playlist.length, nextTrack]);

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {currentTrack ? (
        // biome-ignore lint/a11y/useMediaCaption: background audio player has no caption track
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          onEnded={handleEnded}
          className="pointer-events-none fixed h-0 w-0 opacity-0"
        />
      ) : null}
    </MusicPlayerContext.Provider>
  );
}
