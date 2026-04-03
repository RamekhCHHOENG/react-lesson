import { useState, useMemo } from "react"
import { CalendarIcon, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import type { Sprint } from "@/types"

interface StartSprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprint: Sprint
  taskCount: number
  onStart: (data: {
    name: string
    duration: string
    start_date: string
    end_date: string
    goal: string
  }) => void
}

const DURATION_OPTIONS = [
  { value: "1", label: "1 week" },
  { value: "2", label: "2 weeks" },
  { value: "3", label: "3 weeks" },
  { value: "4", label: "4 weeks" },
  { value: "custom", label: "Custom" },
]

export function StartSprintDialog({
  open,
  onOpenChange,
  sprint,
  taskCount,
  onStart,
}: StartSprintDialogProps) {
  const [name, setName] = useState(sprint.name)
  const [duration, setDuration] = useState("2")
  const [goal, setGoal] = useState(sprint.goal || "")

  const now = new Date()

  const [startDate, setStartDate] = useState(
    now.toISOString().split("T")[0],
  )

  const endDate = useMemo(() => {
    if (duration === "custom") return ""
    const d = new Date(startDate)
    d.setDate(d.getDate() + parseInt(duration) * 7)
    return d.toISOString().split("T")[0]
  }, [startDate, duration])

  const [customEndDate, setCustomEndDate] = useState("")

  const handleStart = () => {
    onStart({
      name,
      duration,
      start_date: startDate,
      end_date: duration === "custom" ? customEndDate : endDate,
      goal,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-[4px] border border-border">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Start Sprint</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{taskCount}</span> work items will be included in this sprint.
          </p>

          <p className="text-xs text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>

          {/* Sprint name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Sprint name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-[3px] h-10"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Duration <span className="text-red-500">*</span>
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="rounded-[3px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Start date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={startDate}
              onChange={(v) => setStartDate(v)}
              placeholder="Select start date"
            />
          </div>

          {/* End date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              End date <span className="text-red-500">*</span>
            </Label>
            {duration === "custom" ? (
              <DatePicker
                value={customEndDate}
                onChange={(v) => setCustomEndDate(v)}
                placeholder="Select end date"
              />
            ) : (
              <Input
                value={endDate}
                disabled
                className="rounded-[3px] h-10 bg-secondary/30 text-muted-foreground"
              />
            )}
          </div>

          {/* Sprint goal */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Sprint goal</Label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
              className="w-full rounded-[3px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="What's the goal of this sprint?"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={!name.trim() || !startDate}
              className="bg-[#0c66e4] hover:bg-[#0055cc] text-white font-bold rounded-[3px] px-6"
            >
              Start
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
