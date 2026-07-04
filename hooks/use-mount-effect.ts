import { type EffectCallback, useEffect } from "react";

export function useMountEffect(effect: EffectCallback) {
  // Intentional: an empty dependency array is the whole point of a mount-only effect.
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(effect, []);
}
