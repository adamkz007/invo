import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 rounded-lg shadow-sm border border-input bg-background", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 pb-4 relative items-center",
        caption_label: "text-base font-semibold text-foreground px-6 py-2",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-background p-0 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors border-input"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "grid grid-cols-7 gap-1",
        head_cell:
          "text-muted-foreground rounded-md font-medium text-[0.9rem] py-2 flex items-center justify-center",
        row: "grid grid-cols-7 gap-1 mt-2",
        cell: "h-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 mx-auto font-normal aria-selected:opacity-100 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-sm",
        day_today: "bg-accent text-accent-foreground font-semibold ring-2 ring-primary ring-offset-1",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
        IconRight: () => <ChevronRight className="h-5 w-5" />
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
