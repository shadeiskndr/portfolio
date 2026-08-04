import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDERS = [
  { id: "a", height: "h-64" },
  { id: "b", height: "h-44" },
  { id: "c", height: "h-56" },
  { id: "d", height: "h-72" },
  { id: "e", height: "h-48" },
  { id: "f", height: "h-60" },
  { id: "g", height: "h-52" },
  { id: "h", height: "h-68" },
  { id: "i", height: "h-44" },
];

export default function PhotoGallerySkeleton() {
  return (
    <div className="columns-2 gap-4 space-y-4 sm:columns-3">
      {PLACEHOLDERS.map(({ id, height }) => (
        <Skeleton className={`w-full rounded-lg ${height}`} key={id} />
      ))}
    </div>
  );
}
