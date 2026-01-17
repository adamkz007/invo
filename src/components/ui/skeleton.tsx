import * as React from "react"

import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse motion-reduce:animate-none rounded-md bg-muted/70 dark:bg-muted/40",
        className
      )}
      {...props}
    />
  )
}

