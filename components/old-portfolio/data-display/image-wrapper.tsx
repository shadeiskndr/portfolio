"use client";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/light-dark-providers";

type ImageWrapperProps = ImageProps & {
  srcForDarkMode?: string | StaticImageData;
};

const ImageWrapper = ({ srcForDarkMode, src, alt, ...props }: ImageWrapperProps) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const finalSrc = resolvedTheme === "dark" ? srcForDarkMode || src : src;

  return <Image src={finalSrc!} alt={alt} {...props} />;
};

export default ImageWrapper;
