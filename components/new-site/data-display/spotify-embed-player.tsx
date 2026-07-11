"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Click-to-play for the /songs disc grid, built on the Spotify IFrame API
 * (https://developer.spotify.com/documentation/embeds/references/iframe-api).
 *
 * Not the Web Playback SDK: that one needs the `streaming` scope, which Spotify
 * grants only to Premium accounts, and it plays for *the logged-in visitor*
 * rather than the site owner — so every guest would have to OAuth into this
 * portfolio with their own Premium account before hearing anything. The embed
 * needs no visitor auth at all.
 *
 * The controller is created lazily on the first play, so a visitor who never
 * clicks a disc never loads Spotify's iframe.
 */

type PlaybackUpdate = {
  playingURI: string;
  isPaused: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
};

type EmbedController = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  destroy: () => void;
  addListener: (
    event: "ready" | "playback_update",
    cb: (e: { data: PlaybackUpdate }) => void
  ) => void;
};

type IFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri?: string; url?: string; width?: string | number; height?: string | number },
    callback: (controller: EmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameApi) => void;
  }
}

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

// `onSpotifyIframeApiReady` is a one-shot global — it never fires again once the
// script has loaded. Cache the promise at module scope so remounts reuse it.
let apiPromise: Promise<IFrameApi> | null = null;

function loadIFrameApi(): Promise<IFrameApi> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = IFRAME_API_SRC;
    script.async = true;
    document.body.appendChild(script);
  });
  return apiPromise;
}

const trackUri = (trackId: string) => `spotify:track:${trackId}`;

type EmbedContextValue = {
  /** Track id currently loaded into the embed, playing or paused. */
  activeTrackId: string | null;
  isPaused: boolean;
  toggle: (trackId: string) => void;
};

const EmbedContext = createContext<EmbedContextValue>({
  activeTrackId: null,
  isPaused: true,
  toggle: () => undefined,
});

export const useSpotifyEmbed = () => useContext(EmbedContext);

export function SpotifyEmbedProvider({ children }: { children: React.ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EmbedController | null>(null);
  // Guards against a second click racing the first controller creation.
  const creatingRef = useRef(false);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  // Mirrors activeTrackId so `toggle` can stay referentially stable.
  const activeTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only tears down; creation is driven by the first toggle().
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const controller = controllerRef.current;

    if (controller) {
      if (id === activeTrackIdRef.current) {
        controller.togglePlay();
      } else {
        activeTrackIdRef.current = id;
        setActiveTrackId(id);
        controller.loadUri(trackUri(id));
        controller.play();
      }
      return;
    }

    if (creatingRef.current) return;
    creatingRef.current = true;
    activeTrackIdRef.current = id;
    setActiveTrackId(id);

    loadIFrameApi().then((api) => {
      const host = hostRef.current;
      if (!host) return;
      api.createController(host, { uri: trackUri(id), width: "100%", height: 80 }, (controller) => {
        controllerRef.current = controller;
        creatingRef.current = false;
        controller.addListener("playback_update", (e) => {
          // `playingURI` is empty until playback actually starts; keep the
          // optimistic id in that window so the disc doesn't flicker.
          const uri = e.data.playingURI;
          if (uri) {
            const nextId = uri.split(":").pop() ?? null;
            activeTrackIdRef.current = nextId;
            setActiveTrackId(nextId);
          }
          setIsPaused(e.data.isPaused);
        });
        controller.play();
      });
    });
  }, []);

  const value = useMemo(
    () => ({ activeTrackId, isPaused, toggle }),
    [activeTrackId, isPaused, toggle]
  );

  return (
    <EmbedContext.Provider value={value}>
      {children}
      <div
        className={
          activeTrackId
            ? "sticky bottom-4 z-30 mt-10 overflow-hidden rounded-xl border bg-card shadow-lg"
            : "hidden"
        }
      >
        {/* Replaced in place by Spotify's iframe once the controller is built. */}
        <div ref={hostRef} />
      </div>
    </EmbedContext.Provider>
  );
}
