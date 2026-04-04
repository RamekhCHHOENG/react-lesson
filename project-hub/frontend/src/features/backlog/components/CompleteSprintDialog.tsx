import { useState } from "react"
import { Trophy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Sprint } from "@/types"

interface CompleteSprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprint: Sprint
  completedCount: number
  openCount: number
  otherSprints: Sprint[]
  onComplete: (moveToSprintId: string | null) => void
}

export function CompleteSprintDialog({
  open,
  onOpenChange,
  sprint,
  completedCount,
  openCount,
  otherSprints,
  onComplete,
}: CompleteSprintDialogProps) {
  const [moveToSprintId, setMoveToSprintId] = useState<string>(
    otherSprints[0]?.id ?? "backlog",
  )
  const [createRetro, setCreateRetro] = useState(true)

  const handleComplete = () => {
    onComplete(moveToSprintId === "backlog" ? null : moveToSprintId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-[4px] border border-border overflow-hidden">
        {/* Trophy banner */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 h-24 flex items-end justify-center relative">
          <div className="absolute -bottom-8">
            <div className="h-16 w-16 rounded-full bg-amber-700/90 border-4 border-amber-600 shadow-xl flex items-center justify-center">
              <Trophy className="h-8 w-8 text-amber-300" />
            </div>
          </div>
        </div>

        <div className="px-6 pt-12 pb-6 space-y-5">
          <DialogTitle className="text-xl font-bold text-center">
            Complete {sprint.name}
          </DialogTitle>

          <p className="text-sm text-muted-foreground leading-relaxed">
            This sprint contains{" "}
            <span className="font-bold text-foreground">
              {completedCount} completed work items
            </span>{" "}
            and{" "}
            <span className="font-bold text-foreground">
              {openCount} open work items
            </span>
            .
          </p>

          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              Completed work items includes everything in the last column on
              the board.
            </li>
            <li>
              Open work items includes everything from any other column on the
              board. Move these to a new sprint or the backlog.
            </li>
          </ul>

          {openCount > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Move open work items to
              </label>
              <Select
                value={moveToSprintId}
                onValueChange={setMoveToSprintId}
              >
                <SelectTrigger className="rounded-[3px] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {otherSprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="backlog">Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Retrospective option */}
          <div className="flex items-start gap-3 p-4 rounded-[3px] bg-secondary/20 border border-border/30">
            <Checkbox
              checked={createRetro}
              onCheckedChange={(checked) =>
                setCreateRetro(checked as boolean)
              }
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                Create a retrospective for this sprint
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Finish off your sprint with a Confluence retrospective!
                Contribute to your team's culture and improve how you work.
              </p>
            </div>
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
              onClick={handleComplete}
              className="bg-[#0c66e4] hover:bg-[#0055cc] text-white font-bold rounded-[3px] px-6"
            >
              Complete sprint
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
