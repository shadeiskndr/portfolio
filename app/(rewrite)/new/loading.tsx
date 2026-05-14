import Loader from "@/components/kokonutui/loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader size="sm" title="Loading…" subtitle="One moment" />
    </div>
  );
}
