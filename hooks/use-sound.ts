"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "new-site.sound-enabled";
const POOL_SIZE = 4;

const SOURCES = {
  mouse: "/sounds/mouse-click.mp3",
  icon: "/sounds/icon-click.mp3",
  sound: "/sounds/pop-sound.mp3",
} as const;

export type SoundVariant = keyof typeof SOURCES;

type Pool = { audios: HTMLAudioElement[]; cursor: number };

let enabled = true;
let initialized = false;
const pools = new Map<SoundVariant, Pool>();
const listeners = new Set<() => void>();

function ensureInit() {
  if (initialized || typeof window === "undefined") {
    return;
  }
  initialized = true;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    enabled = stored === "true";
  }
}

function getPool(variant: SoundVariant): Pool | null {
  if (typeof window === "undefined") {
    return null;
  }
  let pool = pools.get(variant);
  if (!pool) {
    const audios = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(SOURCES[variant]);
      audio.preload = "auto";
      audio.volume = 0.4;
      return audio;
    });
    pool = { audios, cursor: 0 };
    pools.set(variant, pool);
  }
  return pool;
}

function subscribe(listener: () => void) {
  ensureInit();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  return enabled;
}

function getServerSnapshot() {
  return true;
}

export function setSoundEnabled(next: boolean) {
  ensureInit();
  if (enabled === next) {
    return;
  }
  enabled = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  }
  emit();
}

export function toggleSound() {
  setSoundEnabled(!enabled);
}

export function playClick(variant: SoundVariant = "mouse") {
  ensureInit();
  if (!enabled) {
    return;
  }
  const pool = getPool(variant);
  if (!pool) {
    return;
  }
  const audio = pool.audios[pool.cursor % pool.audios.length];
  pool.cursor += 1;
  try {
    audio.currentTime = 0;
    void audio.play();
  } catch {
    // Autoplay restrictions — ignore.
  }
}

export function useSound() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => toggleSound(), []);
  const setEnabled = useCallback((next: boolean) => setSoundEnabled(next), []);
  const play = useCallback((variant?: SoundVariant) => playClick(variant), []);
  return { enabled: value, toggle, setEnabled, playClick: play };
}
