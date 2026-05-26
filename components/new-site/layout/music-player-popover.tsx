"use client";

import { useQuery } from "convex/react";
import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/ui/componentry/music-player";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { playClick } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

const TRIGGER_SIZE = 32;
const MENU_WIDTH = 320;
const MENU_OFFSET_Y = 48;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function colorCoverUri(color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${color}'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FALLBACK_COVER = colorCoverUri("hsl(0 0% 30%)");

const blobVariants: Variants = {
  closed: {
    y: 0,
    borderRadius: 9999,
    width: TRIGGER_SIZE,
    height: TRIGGER_SIZE,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      y: { delay: 0.15 },
      width: { delay: 0 },
      height: { delay: 0 },
      borderRadius: { delay: 0 },
    },
  },
  open: {
    y: MENU_OFFSET_Y,
    borderRadius: 14,
    width: MENU_WIDTH,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      width: { delay: 0.15 },
      height: { delay: 0.15 },
      borderRadius: { delay: 0.15 },
    },
  },
};

const CONTROL_BTN_CLASS = "text-muted-foreground hover:bg-background/60 hover:text-foreground";

export default function MusicPlayerPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"controls" | "playlist">("controls");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(10);
  const isMuted = volume === 0;
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false);

  const playlist = useQuery(api.songs.list) ?? [];
  const currentTrack = playlist[trackIndex];
  const coverArt = currentTrack?.cover ?? FALLBACK_COVER;

  useMountEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  });

  const applyVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
  };

  const togglePlay = () => {
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
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(duration || 0, time));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const changeTrack = (index: number, { switchToControls }: { switchToControls: boolean }) => {
    if (index === trackIndex) {
      if (switchToControls) setView("controls");
      return;
    }
    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    wasPlayingRef.current = true;
    if (switchToControls) setView("controls");
  };

  const selectTrack = (index: number) => changeTrack(index, { switchToControls: true });

  const nextTrack = () =>
    changeTrack((trackIndex + 1) % playlist.length, { switchToControls: false });

  const prevTrack = () =>
    changeTrack((trackIndex - 1 + playlist.length) % playlist.length, { switchToControls: false });

  if (playlist.length === 0 || !currentTrack) return null;

  return (
    <div className="relative">
      {/** biome-ignore lint/a11y/useMediaCaption: background audio player has no caption track */}
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
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      {isOpen && (
        <button
          type="button"
          aria-label="Close music player"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}

      {/* biome-ignore lint/a11y/noSvgWithoutTitle: filter-only svg, decorative and hidden */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
      >
        <defs>
          <filter id="music-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div style={{ filter: "url(#music-goo)" }} className="relative z-20">
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  playClick("icon");
                  setIsOpen((v) => !v);
                  if (isOpen) setView("controls");
                }}
                aria-label={isOpen ? "Close music player" : "Open music player"}
                aria-expanded={isOpen}
                className="relative z-20 rounded-full text-muted-foreground"
              >
                <Play className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent>{isOpen ? "Close music player" : "Open music player"}</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="music-blob"
              variants={blobVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute top-0 right-0 overflow-hidden bg-muted text-foreground shadow-lg ring-1 ring-foreground/10"
            >
              <motion.div
                className="relative w-[320px] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2, delay: 0.2 }}
                layout
              >
                <AnimatePresence mode="wait" initial={false}>
                  {view === "controls" ? (
                    <motion.div
                      key="controls"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex flex-col gap-3 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MusicPlayer
                          coverArt={coverArt}
                          isPlaying={isPlaying}
                          discClassName="h-12 w-12"
                          hideTonearm
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-sm">{currentTrack.title}</div>
                          <div className="truncate text-muted-foreground text-xs">
                            {currentTrack.artist}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <TooltipProvider delay={0}>
                          <Tooltip trackCursorAxis="x">
                            <TooltipTrigger
                              render={
                                <div
                                  onPointerMove={(e) => {
                                    if (!duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = Math.max(
                                      0,
                                      Math.min(1, (e.clientX - rect.left) / rect.width)
                                    );
                                    setHoverTime(pct * duration);
                                  }}
                                >
                                  <Slider
                                    value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                                    onValueChange={(v) => {
                                      if (!duration) return;
                                      const pct = Array.isArray(v) ? v[0] : v;
                                      if (isPlaying) {
                                        wasPlayingRef.current = true;
                                        audioRef.current?.pause();
                                        setIsPlaying(false);
                                      }
                                      seek((pct / 100) * duration);
                                    }}
                                    onValueCommitted={(v) => {
                                      if (!duration) return;
                                      const pct = Array.isArray(v) ? v[0] : v;
                                      seek((pct / 100) * duration);
                                      if (wasPlayingRef.current) {
                                        wasPlayingRef.current = false;
                                        audioRef.current
                                          ?.play()
                                          .then(() => setIsPlaying(true))
                                          .catch(() => {});
                                      }
                                    }}
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    disabled={!duration}
                                  />
                                </div>
                              }
                            />
                            {duration > 0 && (
                              <TooltipContent sideOffset={8}>
                                {formatTime(hoverTime)}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex justify-between text-muted-foreground text-xs tabular-nums">
                          <span>{formatTime(currentTime)}</span>
                          <span>{duration ? formatTime(duration) : "--:--"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Previous track"
                            onClick={prevTrack}
                            disabled={playlist.length < 2}
                            className={CONTROL_BTN_CLASS}
                          >
                            <SkipBack />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={isPlaying ? "Pause" : "Play"}
                            onClick={togglePlay}
                            className={CONTROL_BTN_CLASS}
                          >
                            {isPlaying ? <Pause /> : <Play />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Next track"
                            onClick={nextTrack}
                            disabled={playlist.length < 2}
                            className={CONTROL_BTN_CLASS}
                          >
                            <SkipForward />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Show playlist"
                            onClick={() => setView("playlist")}
                            className={CONTROL_BTN_CLASS}
                          >
                            <ListMusic />
                          </Button>
                        </div>
                        <div className="flex flex-1 items-center gap-1 pl-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                            aria-pressed={isMuted}
                            onClick={() => applyVolume(isMuted ? 10 : 0)}
                            className={CONTROL_BTN_CLASS}
                          >
                            {isMuted ? <VolumeX /> : <Volume2 />}
                          </Button>
                          <Slider
                            value={[volume]}
                            onValueChange={(v) => {
                              const next = Array.isArray(v) ? v[0] : v;
                              applyVolume(next);
                            }}
                            min={0}
                            max={100}
                            step={1}
                            className="flex-1"
                            aria-label="Volume"
                          />
                          <span className="w-7 text-right text-muted-foreground text-xs tabular-nums">
                            {Math.round(volume)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="playlist"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex flex-col gap-2 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">Playlist</div>
                        <button
                          type="button"
                          onClick={() => setView("controls")}
                          className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                        >
                          Back to controls
                        </button>
                      </div>
                      <ul className="-mx-1 flex max-h-64 flex-col overflow-y-auto">
                        {playlist.map((track, index) => {
                          const isActive = index === trackIndex;
                          return (
                            <li key={track.src}>
                              <button
                                type="button"
                                onClick={() => selectTrack(index)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-background/60",
                                  isActive && "bg-background/60"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-4 text-right text-muted-foreground text-xs tabular-nums",
                                    isActive && "text-foreground"
                                  )}
                                >
                                  {index + 1}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      "block truncate text-sm",
                                      isActive ? "text-foreground" : "text-muted-foreground"
                                    )}
                                  >
                                    {track.title}
                                  </span>
                                  <span className="block truncate text-muted-foreground text-xs">
                                    {track.artist}
                                  </span>
                                </span>
                                {isActive && isPlaying && (
                                  <span
                                    aria-hidden
                                    className="ml-2 inline-flex h-3 items-end gap-0.5"
                                  >
                                    <motion.span
                                      className="w-0.5 bg-foreground"
                                      animate={{ height: ["20%", "100%", "40%"] }}
                                      transition={{
                                        duration: 0.9,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                      }}
                                    />
                                    <motion.span
                                      className="w-0.5 bg-foreground"
                                      animate={{ height: ["80%", "30%", "90%"] }}
                                      transition={{
                                        duration: 0.9,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                        delay: 0.15,
                                      }}
                                    />
                                    <motion.span
                                      className="w-0.5 bg-foreground"
                                      animate={{ height: ["50%", "100%", "20%"] }}
                                      transition={{
                                        duration: 0.9,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                        delay: 0.3,
                                      }}
                                    />
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
