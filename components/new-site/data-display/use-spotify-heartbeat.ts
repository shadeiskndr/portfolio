"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

const HEARTBEAT_MS = 60 * 1000;

export function useSpotifyHeartbeat() {
  const viewerSeen = useMutation(api.spotify.viewerSeen);

  useEffect(() => {
    const beat = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      viewerSeen({}).catch(() => undefined);
    };

    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [viewerSeen]);
}
