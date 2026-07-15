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
  const creatingRef = useRef(false);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const activeTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
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
        <div ref={hostRef} />
      </div>
    </EmbedContext.Provider>
  );
}
