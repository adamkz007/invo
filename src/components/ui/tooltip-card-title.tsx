import * as React from "react"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import { HelpCircle } from "lucide-react"

interface TooltipCardTitleProps extends React.ComponentProps<"div"> {
  tooltip?: React.ReactNode
}

function TooltipCardTitle({ className, tooltip, children, ...props }: TooltipCardTitleProps) {
  if (!tooltip) {
    return (
      <div
        data-slot="card-title"
        className={cn("leading-none font-semibold", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        data-slot="card-title"
        className={cn("leading-none font-semibold", className)}
        {...props}
      >
        {children}
      </div>
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger>
          <button 
            type="button" 
            className="inline-flex border-0 bg-transparent p-0 cursor-pointer"
            aria-label="Show tooltip"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent 
          side="top" 
          align="center" 
          sideOffset={5}
          className="text-sm text-white p-2 px-3 bg-black/90 border-black/90 rounded-md max-w-xs shadow-md z-50"
        >
          {tooltip}
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export { TooltipCardTitle }