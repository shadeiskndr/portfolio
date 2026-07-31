"use client";

import Image from "next/image";
import { useAsset } from "@/lib/assets-context";

type AssetImageProps = {
  assetKey: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  "aria-hidden"?: boolean;
  style?: React.CSSProperties;
};

export function AssetImage({
  assetKey,
  alt,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
  unoptimized,
  "aria-hidden": ariaHidden,
  style,
}: AssetImageProps) {
  const asset = useAsset(assetKey);
  if (!asset) return null;

  const common = {
    alt,
    src: asset.url,
    ...(ariaHidden !== undefined && { "aria-hidden": ariaHidden }),
    ...(className !== undefined && { className }),
    ...(priority !== undefined && { priority }),
    ...(sizes !== undefined && { sizes }),
    ...(style !== undefined && { style }),
    ...(unoptimized !== undefined && { unoptimized }),
  };

  if (fill) {
    return <Image {...common} fill />;
  }

  const resolvedWidth = width ?? asset.width ?? undefined;
  const resolvedHeight = height ?? asset.height ?? undefined;

  return (
    <Image
      {...common}
      {...(resolvedWidth !== undefined && { width: resolvedWidth })}
      {...(resolvedHeight !== undefined && { height: resolvedHeight })}
    />
  );
}
