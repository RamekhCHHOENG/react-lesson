import { useState } from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string // "YYYY-MM-DD" format
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  required,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  // Parse the string value to a Date object
  const dateValue = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined
  const selected = dateValue && isValid(dateValue) ? dateValue : undefined

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange?.(format(day, "yyyy-MM-dd"))
    } else {
      onChange?.("")
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded border border-[#DFE1E6] bg-[#FAFBFC] px-3 py-1 text-sm text-[#172B4D]",
            "hover:bg-[#F4F5F7] transition-all outline-none",
            "focus:border-[#4C9AFF] focus:bg-white focus:shadow-[0_0_0_1px_#4C9AFF]",
            !selected && "text-[#A5ADBA]",
            className
          )}
        >
          <span className="truncate">
            {selected ? format(selected, "MMM dd, yyyy") : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-[#6B778C] shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          required={required}
        />
        {selected && (
          <div className="border-t border-[#DFE1E6] px-3 py-2">
            <button
              type="button"
              onClick={() => {
                onChange?.("")
                setOpen(false)
              }}
              className="text-xs text-[#DE350B] hover:underline font-medium"
            >
              Clear date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
