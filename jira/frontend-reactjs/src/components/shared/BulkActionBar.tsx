import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Trash2, ArrowRightLeft, X } from "lucide-react"
import type { TaskStatus, TaskPriority } from "@/types"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/config"

interface BulkActionBarProps {
  selectedCount: number
  onChangeStatus: (status: TaskStatus) => void
  onChangePriority: (priority: TaskPriority) => void
  onDelete: () => void
  onClear: () => void
}

export function BulkActionBar({
  selectedCount,
  onChangeStatus,
  onChangePriority,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-sm border bg-background/95 backdrop-blur shadow-lg px-4 py-3">
      <Badge variant="secondary" className="font-semibold">
        {selectedCount} selected
      </Badge>

      <div className="h-6 w-px bg-border" />

      <Select onValueChange={(v) => onChangeStatus(v as TaskStatus)}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => onChangePriority(v as TaskPriority)}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Set priority" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="destructive" size="sm" className="h-8" onClick={onDelete}>
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        Delete
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
