"use client"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DateTimePicker({ value, onChange, disabled, placeholder = "Select date & time" }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState<string>("10:30:00")

  // Extract time from existing date value
  React.useEffect(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, "0")
      const minutes = value.getMinutes().toString().padStart(2, "0")
      const seconds = value.getSeconds().toString().padStart(2, "0")
      setTime(`${hours}:${minutes}:${seconds}`)
    }
  }, [value])

  // Function to format date as dd/mm/yyyy
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Function to combine date and time
  const combineDateTime = (date: Date, timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number)
    const combined = new Date(date)
    combined.setHours(hours, minutes, seconds, 0)
    return combined
  }

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onChange) {
      const combined = combineDateTime(selectedDate, time)
      onChange(combined)
    }
    setOpen(false)
  }

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (value && onChange) {
      const combined = combineDateTime(value, newTime)
      onChange(combined)
    }
  }

  // Get today's date at midnight for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full justify-between font-normal bg-transparent">
              {value ? formatDate(value) : "Select date"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              disabled={(date) => date < today}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-32">
        <Input
          type="time"
          step="1"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}
