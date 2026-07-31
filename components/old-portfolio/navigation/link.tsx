import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface LinkProps extends NextLinkProps {
  className?: string;
  children?: React.ReactNode;
  noCustomization?: boolean;
  externalLink?: boolean;
  withUnderline?: boolean;
  ref?: React.Ref<HTMLAnchorElement>;
}

function Link({
  noCustomization,
  children = null,
  className = "",
  externalLink = false,
  withUnderline = false,
  ref,
  ...props
}: LinkProps) {
  return (
    <NextLink
      {...props}
      target={externalLink ? "_blank" : "_self"}
      ref={ref}
      className={cn(
        noCustomization ??
          "font-medium text-base text-gray-600 transition-all hover:text-gray-900 active:text-gray-600",
        withUnderline
          ? "underline underline-offset-4 transition-all hover:text-gray-900 active:text-gray-600"
          : "",
        className
      )}
    >
      {children}
    </NextLink>
  );
}

export default Link;
