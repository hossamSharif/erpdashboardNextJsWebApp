"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar, CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(
    date ? format(date, "yyyy-MM-dd") : ""
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value) {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime())) {
        onDateChange?.(parsedDate)
      }
    } else {
      onDateChange?.(undefined)
    }
  }

  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "yyyy-MM-dd"))
    } else {
      setInputValue("")
    }
  }, [date])

  return (
    <div className={cn("relative", className)}>
      <Input
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10"
      />
      <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}