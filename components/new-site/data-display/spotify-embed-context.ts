"use client";

import { createContext, useContext } from "react";

export type EmbedContextValue = {
  activeTrackId: string | null;
  isPaused: boolean;
  toggle: (trackId: string) => void;
};

export const EmbedContext = createContext<EmbedContextValue>({
  activeTrackId: null,
  isPaused: true,
  toggle: () => undefined,
});

export const useSpotifyEmbed = () => useContext(EmbedContext);
