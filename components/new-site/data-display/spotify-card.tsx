"use client";

import Image from "next/image";
import { useLanyard } from "@/hooks/use-lanyard";
import { useSpotifyNowPlaying } from "@/hooks/use-spotify-now-playing";
import { PERSONAL } from "@/lib/new-site/data";

type Track = {
  song: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  url: string;
};

export default function SpotifyCard() {
  const { data: lanyard } = useLanyard();
  const lanyardPlaying = lanyard?.listening_to_spotify ? lanyard.spotify : null;

  // Only fall through to the Web API if Lanyard says we're not listening.
  const { data: fallback } = useSpotifyNowPlaying(!lanyardPlaying);

  let track: Track | null = null;
  let isPlaying = false;

  if (lanyardPlaying) {
    track = {
      song: lanyardPlaying.song,
      artist: lanyardPlaying.artist,
      album: lanyardPlaying.album,
      albumArtUrl: lanyardPlaying.album_art_url,
      url: `https://open.spotify.com/track/${lanyardPlaying.track_id}`,
    };
    isPlaying = true;
  } else if (fallback?.track) {
    track = fallback.track;
    isPlaying = fallback.isPlaying;
  }

  const card = (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
      {track?.albumArtUrl ? (
        <Image
          alt={`${track.album} cover`}
          src={track.albumArtUrl}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded"
        />
      ) : (
        <SpotifyIcon className="h-5 w-5 shrink-0 text-[#1DB954]" />
      )}
      <div className="min-w-0 flex-1">
        {track ? (
          <>
            <p className="truncate font-medium text-xs">{track.song}</p>
            <p className="truncate text-muted-foreground text-xs">
              {isPlaying ? track.artist : `last played · ${track.artist}`}
            </p>
          </>
        ) : (
          <>
            <p className="truncate text-muted-foreground text-xs">{PERSONAL.name} is</p>
            <p className="truncate text-muted-foreground text-xs">currently not playing anything</p>
          </>
        )}
      </div>
    </div>
  );

  if (track) {
    return (
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${track.song} on Spotify`}
        className="block transition-opacity hover:opacity-90"
      >
        {card}
      </a>
    );
  }

  return card;
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="img" className={className}>
      <title>Spotify</title>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.78-.179-.9-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.42-1.021.599-1.561.299z" />
    </svg>
  );
}
