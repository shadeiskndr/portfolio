"use client";

import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, m, type Variants } from "motion/react";
import { useCallback, useId, useState } from "react";
import MobileSheet from "@/components/new-site/layout/mobile-sheet";
import { type Track, useMusicPlayer } from "@/components/new-site/layout/music-player-context";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/ui/componentry/music-player";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export default function MusicPlayerPopover({
  variant = "popover",
}: {
  variant?: "popover" | "sheet";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"controls" | "playlist">("controls");
  const {
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
    selectTrack,
    applyVolume,
  } = useMusicPlayer();

  if (playlist.length === 0 || !currentTrack) return null;

  const player: PlayerApi = {
    isOpen,
    setIsOpen,
    view,
    setView,
    coverArt,
    currentTrack,
    playlist,
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
    selectTrack: (index: number) => {
      selectTrack(index);
      setView("controls");
    },
    applyVolume,
  };

  return (
    <div className="relative">
      {variant === "sheet" ? <MusicSheetPanel {...player} /> : <MusicBlobPanel {...player} />}
    </div>
  );
}

type PlayerApi = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  view: "controls" | "playlist";
  setView: React.Dispatch<React.SetStateAction<"controls" | "playlist">>;
  coverArt: string;
  currentTrack: Track;
  playlist: Track[];
  trackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  hoverTime: number;
  volume: number;
  isMuted: boolean;
  setHoverTime: (n: number) => void;
  scrub: (pct: number) => void;
  commitScrub: (pct: number) => void;
  togglePlay: () => void;
  prevTrack: () => void;
  nextTrack: () => void;
  selectTrack: (index: number) => void;
  applyVolume: (v: number) => void;
};

function MusicSheetPanel(p: PlayerApi) {
  const {
    isOpen,
    setIsOpen,
    view,
    setView,
    coverArt,
    currentTrack,
    playlist,
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
    selectTrack,
    applyVolume,
  } = p;

  const handleOpenClick = useCallback(() => {
    playClick("icon");
    setIsOpen(true);
  }, [setIsOpen]);
  const handleSheetOpenChange = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      if (!next) setView("controls");
    },
    [setIsOpen, setView]
  );
  const handleShowPlaylist = useCallback(() => setView("playlist"), [setView]);
  const handleBackToControls = useCallback(() => setView("controls"), [setView]);
  const handleToggleMute = useCallback(() => applyVolume(isMuted ? 10 : 0), [applyVolume, isMuted]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={isOpen ? "Close music player" : "Open music player"}
        aria-expanded={isOpen}
        onClick={handleOpenClick}
        className="size-10 rounded-full text-muted-foreground"
      >
        <Play className="h-4 w-4" />
      </Button>
      <MobileSheet
        open={isOpen}
        onOpenChange={handleSheetOpenChange}
        title="Music"
        description={currentTrack.title}
      >
        {view === "controls" ? (
          <ControlsView
            coverArt={coverArt}
            isPlaying={isPlaying}
            title={currentTrack.title}
            artist={currentTrack.artist}
            currentTime={currentTime}
            duration={duration}
            hoverTime={hoverTime}
            volume={volume}
            isMuted={isMuted}
            canSkip={playlist.length >= 2}
            onHoverTime={setHoverTime}
            onScrub={scrub}
            onCommitScrub={commitScrub}
            onTogglePlay={togglePlay}
            onPrev={prevTrack}
            onNext={nextTrack}
            onShowPlaylist={handleShowPlaylist}
            onToggleMute={handleToggleMute}
            onVolumeChange={applyVolume}
          />
        ) : (
          <PlaylistView
            playlist={playlist}
            trackIndex={trackIndex}
            isPlaying={isPlaying}
            onSelect={selectTrack}
            onBack={handleBackToControls}
          />
        )}
      </MobileSheet>
    </>
  );
}

function MusicBlobPanel(p: PlayerApi) {
  const gooId = useId();
  const {
    isOpen,
    setIsOpen,
    view,
    setView,
    coverArt,
    currentTrack,
    playlist,
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
    selectTrack,
    applyVolume,
  } = p;

  const handleScrimClick = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleToggleOpen = useCallback(() => {
    playClick("icon");
    setIsOpen((v) => !v);
    if (isOpen) setView("controls");
  }, [setIsOpen, isOpen, setView]);
  const handleShowPlaylist = useCallback(() => setView("playlist"), [setView]);
  const handleBackToControls = useCallback(() => setView("controls"), [setView]);
  const handleToggleMute = useCallback(() => applyVolume(isMuted ? 10 : 0), [applyVolume, isMuted]);
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close music player"
          onClick={handleScrimClick}
          className="fixed inset-0 z-10 cursor-default"
        />
      ) : null}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
      >
        <defs>
          <filter id={gooId}>
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

      <div style={{ filter: `url(#${gooId})` }} className="relative z-20">
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleOpen}
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
          {isOpen ? (
            <m.div
              key="music-blob"
              variants={blobVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute top-0 right-0 overflow-hidden bg-muted text-foreground shadow-lg ring-1 ring-foreground/10"
            >
              <m.div
                className="relative w-[320px] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2, delay: 0.2 }}
                layout
              >
                <AnimatePresence mode="wait" initial={false}>
                  {view === "controls" ? (
                    <m.div
                      key="controls"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex flex-col gap-3 p-4"
                    >
                      <ControlsView
                        coverArt={coverArt}
                        isPlaying={isPlaying}
                        title={currentTrack.title}
                        artist={currentTrack.artist}
                        currentTime={currentTime}
                        duration={duration}
                        hoverTime={hoverTime}
                        volume={volume}
                        isMuted={isMuted}
                        canSkip={playlist.length >= 2}
                        onHoverTime={setHoverTime}
                        onScrub={scrub}
                        onCommitScrub={commitScrub}
                        onTogglePlay={togglePlay}
                        onPrev={prevTrack}
                        onNext={nextTrack}
                        onShowPlaylist={handleShowPlaylist}
                        onToggleMute={handleToggleMute}
                        onVolumeChange={applyVolume}
                      />
                    </m.div>
                  ) : (
                    <m.div
                      key="playlist"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex flex-col gap-2 p-4"
                    >
                      <PlaylistView
                        playlist={playlist}
                        trackIndex={trackIndex}
                        isPlaying={isPlaying}
                        onSelect={selectTrack}
                        onBack={handleBackToControls}
                      />
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

// react-doctor-disable-next-line react-doctor/prefer-explicit-variants
function ControlsView({
  coverArt,
  isPlaying,
  title,
  artist,
  currentTime,
  duration,
  hoverTime,
  volume,
  isMuted,
  canSkip,
  onHoverTime,
  onScrub,
  onCommitScrub,
  onTogglePlay,
  onPrev,
  onNext,
  onShowPlaylist,
  onToggleMute,
  onVolumeChange,
}: {
  coverArt: string;
  isPlaying: boolean;
  title: string;
  artist: string;
  currentTime: number;
  duration: number;
  hoverTime: number;
  volume: number;
  isMuted: boolean;
  canSkip: boolean;
  onHoverTime: (time: number) => void;
  onScrub: (pct: number) => void;
  onCommitScrub: (pct: number) => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onShowPlaylist: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onHoverTime(pct * duration);
    },
    [duration, onHoverTime]
  );
  const handleScrub = useCallback(
    (v: number | readonly number[]) => onScrub(Array.isArray(v) ? v[0] : (v as number)),
    [onScrub]
  );
  const handleCommitScrub = useCallback(
    (v: number | readonly number[]) => onCommitScrub(Array.isArray(v) ? v[0] : (v as number)),
    [onCommitScrub]
  );
  const handleVolumeChange = useCallback(
    (v: number | readonly number[]) => onVolumeChange(Array.isArray(v) ? v[0] : (v as number)),
    [onVolumeChange]
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <MusicPlayer
          coverArt={coverArt}
          isPlaying={isPlaying}
          discClassName="h-12 w-12"
          hideTonearm
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-sm">{title}</div>
          <div className="truncate text-muted-foreground text-xs">{artist}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <TooltipProvider delay={0}>
          <Tooltip trackCursorAxis="x">
            <TooltipTrigger
              render={
                <div onPointerMove={handlePointerMove}>
                  <Slider
                    value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                    onValueChange={handleScrub}
                    onValueCommitted={handleCommitScrub}
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={!duration}
                  />
                </div>
              }
            />
            {duration > 0 && (
              <TooltipContent sideOffset={8}>{formatTime(hoverTime)}</TooltipContent>
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
            onClick={onPrev}
            disabled={!canSkip}
            className={CONTROL_BTN_CLASS}
          >
            <SkipBack />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            className={CONTROL_BTN_CLASS}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next track"
            onClick={onNext}
            disabled={!canSkip}
            className={CONTROL_BTN_CLASS}
          >
            <SkipForward />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Show playlist"
            onClick={onShowPlaylist}
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
            onClick={onToggleMute}
            className={CONTROL_BTN_CLASS}
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
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
    </>
  );
}

function PlaylistRow({
  track,
  index,
  isActive,
  isPlaying,
  onSelect,
}: {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index]);

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
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
          <span className="block truncate text-muted-foreground text-xs">{track.artist}</span>
        </span>
        {isActive && isPlaying ? (
          <span aria-hidden className="ml-2 inline-flex h-3 items-end gap-0.5">
            <m.span
              className="h-full w-0.5 origin-bottom bg-foreground"
              animate={{ scaleY: [0.2, 1, 0.4] }}
              transition={{
                duration: 0.9,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <m.span
              className="h-full w-0.5 origin-bottom bg-foreground"
              animate={{ scaleY: [0.8, 0.3, 0.9] }}
              transition={{
                duration: 0.9,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.15,
              }}
            />
            <m.span
              className="h-full w-0.5 origin-bottom bg-foreground"
              animate={{ scaleY: [0.5, 1, 0.2] }}
              transition={{
                duration: 0.9,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </span>
        ) : null}
      </button>
    </li>
  );
}

function PlaylistView({
  playlist,
  trackIndex,
  isPlaying,
  onSelect,
  onBack,
}: {
  playlist: Track[];
  trackIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">Playlist</div>
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          Back to controls
        </button>
      </div>
      <ul className="-mx-1 flex max-h-64 flex-col overflow-y-auto">
        {playlist.map((track, index) => (
          <PlaylistRow
            key={track.src}
            track={track}
            index={index}
            isActive={index === trackIndex}
            isPlaying={isPlaying}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </>
  );
}
