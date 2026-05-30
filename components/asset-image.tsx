"use client";

import Image from "next/image";
import { useAsset } from "@/lib/assets-provider";

type AssetImageProps = {
  assetKey: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Fill the nearest positioned ancestor instead of using intrinsic dimensions. */
  fill?: boolean;
  /** Override the asset's intrinsic width (e.g. for a fixed-size badge). */
  width?: number;
  /** Override the asset's intrinsic height. */
  height?: number;
  /** Skip the Next image optimizer (use for tiny vector/SVG icons). */
  unoptimized?: boolean;
  /** Hide from the a11y tree (e.g. a decorative dark-mode logo variant). */
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

  if (fill) {
    return (
      <Image
        alt={alt}
        aria-hidden={ariaHidden}
        className={className}
        fill
        priority={priority}
        sizes={sizes}
        src={asset.url}
        style={style}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      alt={alt}
      aria-hidden={ariaHidden}
      className={className}
      height={height ?? asset.height ?? undefined}
      priority={priority}
      sizes={sizes}
      src={asset.url}
      style={style}
      unoptimized={unoptimized}
      width={width ?? asset.width ?? undefined}
    />
  );
}
