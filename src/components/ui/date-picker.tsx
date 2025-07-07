"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"

interface DatePickerProps {
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  fromDate?: Date
  toDate?: Date
}

export function DatePicker({
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  fromDate,
  toDate
}: DatePickerProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  // Handle date constraints
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  if (fromDate && date < fromDate) return true
                  if (toDate && date > toDate) return true
                  return false
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 