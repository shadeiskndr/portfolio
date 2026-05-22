"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FlipAvatar({
  frontSrc,
  backSrc,
  alt,
}: {
  frontSrc: string;
  backSrc: string;
  alt: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      aria-label={isFlipped ? "Show front of avatar" : "Show back of avatar"}
      aria-pressed={isFlipped}
      className="group perspective-distant relative mx-auto block aspect-square w-full max-w-44 cursor-pointer"
      onClick={() => setIsFlipped((f) => !f)}
      type="button"
    >
      <div
        className={cn(
          "transform-3d relative h-full w-full transition-transform duration-700 ease-out",
          isFlipped ? "transform-[rotateY(180deg)]" : "transform-[rotateY(0deg)]"
        )}
      >
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-xl bg-muted">
          <Image alt={alt} className="object-cover" fill priority sizes="240px" src={frontSrc} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 overflow-hidden rounded-xl bg-muted">
          <Image alt={alt} className="object-cover" fill sizes="240px" src={backSrc} />
        </div>
      </div>
    </button>
  );
}
