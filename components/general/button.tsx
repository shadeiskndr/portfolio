"use client";

import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

interface ButtonProps extends useRender.ComponentProps<"button"> {}

function Button({ className, render = <button type="button" />, ...props }: ButtonProps) {
  return useRender({
    render,
    props: {
      className: cn(
        "inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-1.5 font-medium text-gray-50 transition-colors duration-200 hover:bg-gray-700 active:bg-gray-800",
        className
      ),
      ...props,
    },
  });
}

export default Button;
