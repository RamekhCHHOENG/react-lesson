import { useMemo } from "react"
import { format, differenceInDays, parseISO, max, min } from "date-fns"
import { cn } from "@/lib/utils"
import type { Epic } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface RoadmapTimelineProps {
  epics: Epic[]
}

export function RoadmapTimeline({ epics }: RoadmapTimelineProps) {
  const epicsWithDates = useMemo(
    () => epics.filter((e) => e.start_date && e.target_date),
    [epics]
  )

  const { timelineStart, totalDays, months } = useMemo(() => {
    if (epicsWithDates.length === 0) {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      return {
        timelineStart: start,
        timelineEnd: end,
        totalDays: differenceInDays(end, start),
        months: getMonthHeaders(start, end),
      }
    }

    const starts = epicsWithDates.map((e) => parseISO(e.start_date!))
    const ends = epicsWithDates.map((e) => parseISO(e.target_date!))
    const earliest = min(starts)
    const latest = max(ends)

    // Add padding
    const start = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
    const end = new Date(latest.getFullYear(), latest.getMonth() + 1, 0)
    const days = Math.max(differenceInDays(end, start), 30)

    return {
      timelineStart: start,
      timelineEnd: end,
      totalDays: days,
      months: getMonthHeaders(start, end),
    }
  }, [epicsWithDates])

  if (epicsWithDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No epics with dates to display on the timeline.</p>
        <p className="text-xs mt-1">Set start and target dates on your epics to see them here.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[800px]">
        {/* Month headers */}
        <div className="flex border-b mb-2">
          <div className="w-48 shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground">
            Epic
          </div>
          <div className="flex-1 flex">
            {months.map((m) => (
              <div
                key={m.label}
                className="border-l px-2 py-2 text-xs font-medium text-muted-foreground"
                style={{ width: `${(m.days / totalDays) * 100}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {epicsWithDates.map((epic) => {
          const start = parseISO(epic.start_date!)
          const end = parseISO(epic.target_date!)
          const offsetDays = Math.max(0, differenceInDays(start, timelineStart))
          const duration = Math.max(1, differenceInDays(end, start))
          const leftPct = (offsetDays / totalDays) * 100
          const widthPct = Math.min((duration / totalDays) * 100, 100 - leftPct)
          const progress = epic.tasks_total > 0 ? (epic.tasks_done / epic.tasks_total) * 100 : 0

          return (
            <div key={epic.id} className="flex items-center group hover:bg-accent/30 transition-colors">
              <div className="w-48 shrink-0 px-3 py-3 truncate">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: epic.color }} />
                  <span className="text-sm font-medium truncate">{epic.name}</span>
                </div>
              </div>
              <div className="flex-1 relative h-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-6 rounded-full cursor-pointer",
                        "transition-shadow hover:shadow-md"
                      )}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 1)}%`,
                        backgroundColor: epic.color,
                        opacity: 0.85,
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="h-full rounded-full opacity-40 bg-white"
                        style={{ width: `${100 - progress}%`, marginLeft: "auto" }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p className="font-medium">{epic.name}</p>
                      <p>{format(start, "MMM d")} – {format(end, "MMM d, yyyy")}</p>
                      <p>
                        {epic.tasks_done}/{epic.tasks_total} tasks done
                        ({Math.round(progress)}%)
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ borderColor: epic.color, color: epic.color }}
                      >
                        {epic.status}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function getMonthHeaders(start: Date, end: Date) {
  const months: { label: string; days: number }[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0)

  while (current <= endDate) {
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
    const effectiveEnd = monthEnd > endDate ? endDate : monthEnd
    const effectiveStart = current < start ? start : current
    const days = differenceInDays(effectiveEnd, effectiveStart) + 1

    months.push({
      label: format(current, "MMM yyyy"),
      days,
    })

    current.setMonth(current.getMonth() + 1)
    current.setDate(1)
  }

  return months
}
