export function DemoFallback({ label }: { label: string }) {
  return (
    <div className="my-6 flex h-48 items-center justify-center rounded-xl border text-muted-foreground text-sm">
      Loading {label}…
    </div>
  );
}
