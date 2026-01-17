"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        role="alert"
        className="w-full max-w-md rounded-lg border bg-card p-6 text-center space-y-4"
      >
        <div className="space-y-1">
          <div className="text-lg font-semibold">Couldn’t load invoices</div>
          <div className="text-sm text-muted-foreground">
            Please try again. If this keeps happening, reload the page.
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </div>
  )
}

