import type { Task } from "@/types/project"
import { formatDate } from "@/lib/utils"
import { getTaskStatusConfig } from "@/config"
import { User, Calendar, FolderKanban, Pencil, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface BoardTask extends Task {
  projectId: string
  projectName: string
}

interface TaskDetailDrawerProps {
  task: BoardTask | null
  open: boolean
  onClose: () => void
  onEdit: (task: BoardTask) => void
  onDelete: (task: BoardTask) => void
}

export function TaskDetailDrawer({
  task,
  open,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailDrawerProps) {
  if (!task && !open) return null

  const statusCfg = task ? getTaskStatusConfig(task.status) : null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 flex flex-col"
      >
        {task && (
          <>
            {/* Header */}
            <div className="border-b px-6 pt-6 pb-4 shrink-0">
              <SheetHeader className="space-y-1">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <SheetTitle className="text-lg font-semibold leading-snug">
                    {task.title}
                  </SheetTitle>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <SheetDescription className="text-[13px] leading-relaxed">
                  {task.description || "No description"}
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-0.5">
                {/* Status */}
                <DetailRow label="Status">
                  {statusCfg && (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: statusCfg.dotColor + "20",
                        color: statusCfg.dotColor,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  )}
                </DetailRow>

                {/* Project */}
                <DetailRow label="Project">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                    {task.projectName}
                  </div>
                </DetailRow>

                {/* Assignee */}
                <DetailRow label="Assignee">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {task.assignee || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </DetailRow>

                {/* Due Date */}
                <DetailRow label="Due Date">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {task.dueDate ? (
                      formatDate(task.dueDate)
                    ) : (
                      <span className="text-muted-foreground">No due date</span>
                    )}
                  </div>
                </DetailRow>

                {/* Created */}
                <DetailRow label="Created">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(task.createdAt)}
                  </div>
                </DetailRow>

                {/* Updated */}
                <DetailRow label="Updated">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(task.updatedAt)}
                  </div>
                </DetailRow>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-[13px] text-muted-foreground font-medium">
        {label}
      </span>
      {children}
    </div>
  )
}
