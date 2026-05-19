"use client";

import { motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

export interface MusicPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The source URL of the audio file or YouTube video */
  src?: string;
  /** The URL of the album cover image */
  coverArt: string;
  /** Whether to auto-play the audio when loaded */
  autoPlay?: boolean;
  /** Controlled play state. When provided, audio/iframe is disabled and click does not toggle. */
  isPlaying?: boolean;
  /** Override the default disc dimensions (defaults to h-64 w-64 md:h-80 md:w-80). */
  discClassName?: string;
  /** Hide the tonearm — useful at very small disc sizes where the fixed-size tonearm looks oversized. */
  hideTonearm?: boolean;
}

export function MusicPlayer({
  className,
  src,
  coverArt,
  autoPlay = false,
  isPlaying: controlledIsPlaying,
  discClassName,
  hideTonearm = false,
  ...props
}: MusicPlayerProps) {
  const isControlled = controlledIsPlaying !== undefined;
  const [internalIsPlaying, setInternalIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const isPlaying = isControlled ? controlledIsPlaying : internalIsPlaying;
  const isSpinning = isPlaying && !isHovered;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Extract YouTube ID if it's a YouTube URL
  const getYoutubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
    );
    return match ? match[1] : null;
  };

  const youtubeId = !isControlled && src ? getYoutubeId(src) : null;

  const playMedia = () => {
    if (youtubeId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    } else {
      audioRef.current?.play().catch(() => setInternalIsPlaying(false));
    }
  };

  const pauseMedia = () => {
    if (youtubeId && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    } else {
      audioRef.current?.pause();
    }
  };

  useMountEffect(() => {
    if (!isControlled && autoPlay) {
      playMedia();
    }
  });

  const togglePlay = () => {
    if (isControlled) return;
    const next = !internalIsPlaying;
    setInternalIsPlaying(next);
    if (next) {
      playMedia();
    } else {
      pauseMedia();
    }
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} {...props}>
      {!isControlled &&
        (youtubeId ? (
          <iframe
            ref={iframeRef}
            title="Music player"
            className="hidden"
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=${
              autoPlay ? 1 : 0
            }&controls=0`}
            allow="autoplay"
          />
        ) : src ? (
          <audio
            ref={audioRef}
            src={src}
            onEnded={() => setInternalIsPlaying(false)}
            className="hidden"
          >
            <track kind="captions" />
          </audio>
        ) : null)}

      <div
        className={cn(
          "relative select-none",
          !isControlled && "cursor-pointer",
          discClassName ?? "h-64 w-64 md:h-80 md:w-80"
        )}
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isControlled ? undefined : isPlaying ? "Pause" : "Play"}
      >
        {/* Tonearm */}
        {!hideTonearm && (
          <motion.div
            className="pointer-events-none absolute top-[-2%] right-[-4%] z-20 h-[15%] w-[60%] origin-top-right"
            initial={{ rotate: 10 }}
            animate={{ rotate: isPlaying ? -20 : 10 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Tonearm base */}
            <div className="absolute top-0 right-0 z-10 h-[85%] w-[21%] translate-x-1/2 -translate-y-1/2 transform rounded-full border border-zinc-200 bg-zinc-400 shadow-md dark:border-zinc-800 dark:bg-zinc-600" />
            {/* Tonearm stick & Needle */}
            <div className="absolute top-0 right-[7%] flex h-[25%] w-[70%] origin-right -rotate-12 items-center justify-start rounded-full bg-zinc-400 shadow-sm dark:bg-zinc-500">
              {/* Needle */}
              <div className="aspect-square h-[180%] -translate-x-1/2 transform rounded-full bg-zinc-800 shadow-md dark:bg-zinc-300" />
            </div>
          </motion.div>
        )}

        {/* Record Disc */}
        <div
          className={cn(
            "relative h-full w-full animate-spin overflow-hidden rounded-full border-4 border-black/10 bg-black shadow-black/30 shadow-xl sm:border-8 dark:border-white/10"
          )}
          style={{
            animationDuration: "4s",
            animationPlayState: isSpinning ? "running" : "paused",
          }}
        >
          {/* Album Cover Background */}
          <div
            className="absolute inset-0 bg-center bg-cover opacity-90 transition-opacity"
            style={{ backgroundImage: `url(${coverArt})` }}
          />

          {/* Grooves Overlay (Multiple dark gradient rings) */}
          <div
            className="absolute inset-0 rounded-full border border-black/20"
            style={{
              background:
                "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 21%, transparent 22%, transparent 35%, rgba(0,0,0,0.5) 36%, transparent 37%, transparent 50%, rgba(0,0,0,0.3) 51%, transparent 52%, transparent 65%, rgba(0,0,0,0.6) 66%, transparent 67%, transparent 80%, rgba(0,0,0,0.4) 81%, transparent 82%)",
            }}
          />

          {/* Glare effect */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
