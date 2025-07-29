"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"

interface ReactDatePickerProps {
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  dateFormat?: string
}

export function ReactDatePickerComponent({
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  dateFormat = "yyyy-MM-dd"
}: ReactDatePickerProps) {
  const form = useFormContext()
  const [inputValue, setInputValue] = React.useState<string>("")  
  const datePickerRef = React.useRef<DatePicker>(null)

  // Initialize input value when field value changes
  React.useEffect(() => {
    const fieldValue = form.getValues(name)
    if (fieldValue && isValid(fieldValue)) {
      setInputValue(format(fieldValue, dateFormat))
    }
  }, [form, name, dateFormat])

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      form.setValue(name, date, { shouldValidate: true })
      setInputValue(format(date, dateFormat))
      // With portal, we don't need to manually close the popup
      // It will close automatically after selection
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel className="font-medium">{label}</FormLabel>
          <div className="relative">
            <FormControl>
                <div className="relative w-full">
                  <DatePicker
                    ref={datePickerRef}
                    selected={field.value}
                    onChange={handleDateChange}
                    dateFormat={dateFormat}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText={placeholder}
                    disabled={disabled}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    showPopperArrow={false}
                    popperClassName="react-datepicker-popper"
                    popperPlacement="bottom-start"
                    portalId="datepicker-portal"
                    withPortal
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary transition-colors"
                    disabled={disabled}
                    onClick={() => {
                      const input = datePickerRef.current?.input
                      if (input) {
                        input.focus()
                      }
                    }}
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </div>
              </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}