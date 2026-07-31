// biome-ignore-all lint/correctness/useExhaustiveDependencies: run-on-mount-only is the entire contract of this hook; a per-site ignore would displace the adjacent react-doctor suppression
import { type EffectCallback, useEffect } from "react";

export function useMountEffect(effect: EffectCallback) {
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(effect, []);
}
