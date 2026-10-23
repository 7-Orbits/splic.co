export function LoadingState({ label = "Loading console" }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none" />
      <div className="h-4 w-full max-w-[560px] animate-pulse rounded bg-surface-raised motion-reduce:animate-none" />
      <div className="mt-2 grid gap-4 lg:grid-cols-3">
        <div className="h-44 animate-pulse rounded-lg border border-border-subtle bg-surface-primary motion-reduce:animate-none lg:col-span-2" />
        <div className="h-44 animate-pulse rounded-lg border border-border-subtle bg-surface-primary motion-reduce:animate-none" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-lg border border-border-subtle bg-surface-primary motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-lg border border-border-subtle bg-surface-primary motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-lg border border-border-subtle bg-surface-primary motion-reduce:animate-none" />
      </div>
    </div>
  );
}
