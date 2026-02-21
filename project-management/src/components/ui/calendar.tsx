import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-[#172B4D]",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-0 inline-flex items-center justify-center h-7 w-7 bg-transparent hover:bg-[#EBECF0] rounded text-[#42526E] hover:text-[#172B4D] transition-colors",
        button_next:
          "absolute right-1 top-0 inline-flex items-center justify-center h-7 w-7 bg-transparent hover:bg-[#EBECF0] rounded text-[#42526E] hover:text-[#172B4D] transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-[#6B778C] rounded-md w-8 font-normal text-[0.8rem] flex items-center justify-center",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#E9F2FF] [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#E9F2FF]/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day_button: cn(
          "inline-flex items-center justify-center h-8 w-8 p-0 font-normal",
          "rounded hover:bg-[#EBECF0] text-[#172B4D] transition-colors",
          "aria-selected:opacity-100"
        ),
        selected:
          "bg-[#0052CC] text-white hover:bg-[#0065FF] hover:text-white focus:bg-[#0052CC] focus:text-white rounded",
        today: "bg-[#DEEBFF] text-[#0052CC] rounded font-semibold",
        outside:
          "day-outside text-[#A5ADBA] aria-selected:bg-[#E9F2FF]/50 aria-selected:text-[#6B778C]",
        disabled: "text-[#C1C7D0] cursor-not-allowed opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
