"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleRetry = useCallback(() => reset(), [reset]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 py-16">
      <h1 className="font-semibold font-serif text-2xl tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">
        This part of the page failed to load. Retrying usually fixes it.
      </p>
      <Button onClick={handleRetry} variant="outline">
        Try again
      </Button>
    </div>
  );
}
