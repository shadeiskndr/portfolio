"use client";

import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SpotifyIcon } from "@/components/icons/simple-icons-spotify";
import { MusicPlayer } from "@/components/ui/componentry/music-player";
import { Marquee, MarqueeContent, MarqueeEdge, MarqueeItem } from "@/components/ui/diceui/marquee";
import { api } from "@/convex/_generated/api";
import { PERSONAL } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";

export default function SpotifyCard() {
  const status = useQuery(api.spotify.getNowPlaying);
  const [hovered, setHovered] = useState(false);

  const hasTrack = Boolean(status?.song);
  const albumArt = status?.albumArtUrl ?? "";
  const isPlaying = status?.isPlaying ?? false;
  const expanded = hovered && hasTrack && albumArt !== "";

  const spinStyle = isPlaying ? { animationDuration: "4s" } : undefined;

  const statusText = hasTrack ? (
    <>
      {PERSONAL.name} is {isPlaying ? "currently listening to" : "last listened to"}{" "}
      <span className="font-medium text-foreground">{status?.song}</span>
      {" by "}
      <span className="font-medium text-foreground">{status?.artist}</span>
    </>
  ) : (
    <>{PERSONAL.name} is currently not listening to anything</>
  );

  const wrapper = (
    <motion.div
      className="relative"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Always-visible marquee card */}
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <SpotifyIcon
            className={cn("h-5 w-5 shrink-0 text-[#1DB954]", isPlaying && "animate-spin")}
            style={spinStyle}
          />
          <Marquee speed={28} autoFill className="min-w-0 flex-1">
            <MarqueeEdge side="left" size="sm" />
            <MarqueeEdge side="right" size="sm" />
            <MarqueeContent>
              <MarqueeItem className="whitespace-nowrap text-muted-foreground text-xs">
                {statusText}
              </MarqueeItem>
            </MarqueeContent>
          </Marquee>
        </div>
      </div>

      {/* Popover with vinyl + track info */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 bottom-full left-0 z-20 pb-2"
          >
            <div className="overflow-hidden rounded-lg border bg-card shadow-xl">
              <div className="flex items-center gap-3 p-3">
                <MusicPlayer
                  coverArt={albumArt}
                  isPlaying={isPlaying}
                  discClassName="h-14 w-14"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-xs">{status?.song}</p>
                  <p className="line-clamp-2 text-muted-foreground text-xs">
                    {status?.artist}
                    {status?.album ? ` · ${status.album}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (hasTrack && status?.url) {
    return (
      <a
        href={status.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${status.song} on Spotify`}
        className="block"
      >
        {wrapper}
      </a>
    );
  }

  return wrapper;
}
