"use client";

import { useState } from "react";
import { AssetImage } from "@/components/asset-image";
import { cn } from "@/lib/utils";

export default function FlipAvatar({
  frontKey,
  backKey,
  alt,
}: {
  frontKey: string;
  backKey: string;
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
          <AssetImage
            alt={alt}
            assetKey={frontKey}
            className="object-cover"
            fill
            priority
            sizes="240px"
          />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 overflow-hidden rounded-xl bg-muted">
          <AssetImage alt={alt} assetKey={backKey} className="object-cover" fill sizes="240px" />
        </div>
      </div>
    </button>
  );
}
