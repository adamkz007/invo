export default function Loading() {
  return (
    <div className="invo-loading-delay space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading dashboard</span>
      <div className="space-y-2">
        <div className="h-9 w-44 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
        <div className="h-4 w-72 max-w-[70vw] rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <div className="h-4 w-24 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
            <div className="h-8 w-28 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
            <div className="h-4 w-16 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-4">
          <div className="h-5 w-36 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
          <div className="h-64 w-full rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <div className="h-5 w-40 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
          <div className="h-64 w-full rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
