import { Skeleton } from "@/components/ui/skeleton";

const PARAGRAPH_LINES = [
  { id: "a", width: "w-full" },
  { id: "b", width: "w-full" },
  { id: "c", width: "w-11/12" },
  { id: "d", width: "w-full" },
  { id: "e", width: "w-4/5" },
];

export default function PostSkeleton() {
  return (
    <div>
      <header className="mb-8 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-full max-w-lg md:h-10" />
        <Skeleton className="h-5 w-full max-w-md" />
      </header>
      <div className="space-y-3">
        {PARAGRAPH_LINES.map(({ id, width }) => (
          <Skeleton className={`h-4 ${width}`} key={id} />
        ))}
      </div>
    </div>
  );
}
