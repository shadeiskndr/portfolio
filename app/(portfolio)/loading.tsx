import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8 space-y-2 sm:mb-10">
        <Skeleton className="h-9 w-56 sm:h-10" />
        <Skeleton className="h-5 w-full max-w-md" />
      </header>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
