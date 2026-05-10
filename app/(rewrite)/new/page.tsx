export default function NewHome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-bold text-3xl tracking-tight">New site coming</h1>
      <p className="text-muted-foreground">
        This is the placeholder for the rewrite. The current portfolio lives at{" "}
        <a href="/old" className="underline">
          /old
        </a>
        .
      </p>
    </div>
  );
}
