import { type EffectCallback, useEffect } from "react";

export function useMountEffect(effect: EffectCallback) {
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(effect, []);
}
