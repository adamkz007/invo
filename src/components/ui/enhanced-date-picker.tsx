"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
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
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormContext } from "react-hook-form"

interface EnhancedDatePickerProps {
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  fromDate?: Date
  toDate?: Date
  dateFormat?: string
}

export function EnhancedDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  fromDate,
  toDate,
  dateFormat = "yyyy-MM-dd"
}: EnhancedDatePickerProps) {
  const form = useFormContext()
  const [inputValue, setInputValue] = React.useState<string>("")  
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize input value when field value changes
  React.useEffect(() => {
    const fieldValue = form.getValues(name)
    if (fieldValue && isValid(fieldValue)) {
      setInputValue(format(fieldValue, dateFormat))
    }
  }, [form, name, dateFormat])

  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Try to parse the input value as a date
    try {
      const parsedDate = parse(value, dateFormat, new Date())
      if (isValid(parsedDate)) {
        form.setValue(name, parsedDate, { shouldValidate: true })
      }
    } catch (error) {
      // Invalid date format, don't update the form value
    }
  }

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue(name, date, { shouldValidate: true })
      setInputValue(format(date, dateFormat))
      setIsOpen(false) // Close calendar popup on selection
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel className="font-medium">{label}</FormLabel>
          <div className="relative flex items-center">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <div className="relative flex-1">
                <FormControl>
                  <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="pr-10 rounded-md border-input focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    onFocus={() => setIsOpen(true)}
                  />
                </FormControl>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary transition-colors"
                    disabled={disabled}
                    onClick={() => setIsOpen(true)}
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0 rounded-lg overflow-hidden shadow-lg border border-input" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={handleCalendarSelect}
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
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}