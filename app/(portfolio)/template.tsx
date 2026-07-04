"use client";

import { m, useReducedMotion } from "motion/react";
import { useMountEffect } from "@/hooks/use-mount-effect";

let hasMounted = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const skipInitial = !hasMounted;

  useMountEffect(() => {
    hasMounted = true;
  });

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col *:w-full"
      initial={skipInitial ? false : { opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
