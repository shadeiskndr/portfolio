"use client";

import { motion } from "motion/react";
import * as opentype from "opentype.js";
import { useId, useMemo, useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { cn } from "@/lib/utils";

const DEFAULT_FONT_URL = "/LastoriaBoldRegular.otf";

const PATH_VARIANTS = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

interface SignatureProps {
  /** Text to generate signature for */
  text?: string;
  /** Color of the signature path */
  color?: string;
  /** Font size of the signature */
  fontSize?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** Only animate when in view */
  inView?: boolean;
  /** Only animate once */
  once?: boolean;
  /** Custom font URL to load */
  fontUrl?: string;
}

export function Signature({ fontUrl, ...props }: SignatureProps) {
  // Remount (and reload the font) whenever the source font changes.
  return <SignatureInner key={fontUrl ?? "default"} fontUrl={fontUrl} {...props} />;
}

function SignatureInner({
  text = "Signature",
  color = "currentColor",
  fontSize = 32,
  duration = 1.5,
  delay = 0,
  className,
  inView = false,
  once = true,
  fontUrl,
}: SignatureProps) {
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const height = fontSize * 3; // Give plenty of vertical space
  const horizontalPadding = fontSize * 0.1;
  const baseline = fontSize * 1.5; // Shift down
  const maskId = `signature-reveal-${useId().replace(/:/g, "")}`;

  // Load the font once on mount (external async sync, not derivable state).
  useMountEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(fontUrl ?? DEFAULT_FONT_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const loaded = opentype.parse(await response.arrayBuffer());

        if (!cancelled) setFont(loaded);
      } catch (error) {
        if (cancelled) return;
        console.error("Signature component font load error:", error);
        setLoadFailed(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  });

  // Derive the glyph paths from the loaded font (Rule 1: derive, don't sync).
  const { paths, width } = useMemo(() => {
    if (!font) {
      return {
        paths: [] as string[],
        width: loadFailed ? text.length * fontSize * 0.6 : 300,
      };
    }

    let x = horizontalPadding;
    const newPaths: string[] = [];

    for (const char of text) {
      const glyph = font.charToGlyph(char);
      const path = glyph.getPath(x, baseline, fontSize);
      newPaths.push(path.toPathData(3));

      const advanceWidth = glyph.advanceWidth ?? font.unitsPerEm;
      x += advanceWidth * (fontSize / font.unitsPerEm);
    }

    return { paths: newPaths, width: x + horizontalPadding };
  }, [font, loadFailed, text, fontSize, baseline, horizontalPadding]);

  return (
    <motion.svg
      key={paths.length}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible text-foreground", className)}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {paths.map((d, i) => (
            <motion.path
              // Index keys are safe here: `paths` is regenerated wholesale by the
              // useMemo (never reordered/spliced), and each entry's identity IS its
              // character position in `text`. Path data can collide (e.g. repeated
              // spaces yield identical empty paths), so `d` cannot be the key.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              key={i}
              d={d}
              stroke="white"
              strokeWidth={fontSize * 0.22}
              fill="none"
              variants={PATH_VARIANTS}
              transition={{
                pathLength: {
                  delay: delay + i * 0.2,
                  duration,
                  ease: "easeInOut",
                },
                opacity: {
                  delay: delay + i * 0.2 + 0.01,
                  duration: 0.01,
                },
              }}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </mask>
      </defs>

      {paths.map((d, i) => (
        <motion.path
          // Safe for the same reason as the mask paths above: positional identity,
          // array replaced atomically, path data not guaranteed unique.
          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
          key={i}
          d={d}
          stroke={color}
          strokeWidth={2}
          fill="none"
          variants={PATH_VARIANTS}
          transition={{
            pathLength: {
              delay: delay + i * 0.2,
              duration,
              ease: "easeInOut",
            },
            opacity: {
              delay: delay + i * 0.2 + 0.01,
              duration: 0.01,
            },
          }}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      ))}

      <g mask={`url(#${maskId})`}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={color} />
        ))}
      </g>
    </motion.svg>
  );
}
