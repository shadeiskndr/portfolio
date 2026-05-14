"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

let hasMounted = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const skipInitial = !hasMounted;

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <motion.div
      initial={skipInitial ? false : { opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
