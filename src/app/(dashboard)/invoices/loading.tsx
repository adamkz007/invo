export default function Loading() {
  return (
    <div className="invo-loading-delay space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading invoices</span>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-36 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
          <div className="h-4 w-80 max-w-[70vw] rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
        </div>
        <div className="h-10 w-32 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="h-10 w-full rounded-md bg-muted/70 animate-pulse sm:col-span-2" aria-hidden="true" />
        <div className="h-10 w-full rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
      </div>

      <div className="rounded-md border">
        <div className="border-b bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
            <div className="h-4 w-20 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
            <div className="h-4 w-20 rounded-md bg-muted/70 animate-pulse hidden sm:block" aria-hidden="true" />
            <div className="h-4 w-16 rounded-md bg-muted/70 animate-pulse ml-auto" aria-hidden="true" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3">
              <div className="h-4 w-32 rounded-md bg-muted/70 animate-pulse" aria-hidden="true" />
              <div className="h-4 w-40 rounded-md bg-muted/70 animate-pulse hidden sm:block" aria-hidden="true" />
              <div className="h-4 w-28 rounded-md bg-muted/70 animate-pulse hidden md:block" aria-hidden="true" />
              <div className="h-4 w-20 rounded-md bg-muted/70 animate-pulse ml-auto" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
