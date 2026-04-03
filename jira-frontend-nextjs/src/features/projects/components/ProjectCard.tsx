import { useState } from "react"
import type { Project } from "@/types/project"
import { PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from "@/config"
import { formatDate } from "@/lib/utils"
import { Calendar, ListTodo, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

interface ProjectCardProps {
  project: Project
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const tasksDone = project.tasks.filter((t) => t.status === "done").length
  const totalTasks = project.tasks.length
  const progress = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0
  const statusCfg = PROJECT_STATUS_CONFIG[project.status]
  const priorityCfg = PROJECT_PRIORITY_CONFIG[project.priority]

  return (
    <div className="group bg-card rounded border hover:border-muted-foreground/40 hover:shadow-sm transition-all">
      {/* Top color strip */}
      <div className="h-1 rounded-t" style={{ backgroundColor: statusCfg?.dotColor ?? "#DFE1E6" }} />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {project.key || "PRJ"}
            </p>
            <h3
              className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => onView(project.id)}
            >
              {project.name}
            </h3>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(project.id)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(project.id)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {project.description || "No description"}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: statusCfg?.dotColor + "18", color: statusCfg?.dotColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg?.dotColor }} />
            {statusCfg?.label}
          </span>
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: priorityCfg?.dotColor + "18", color: priorityCfg?.dotColor }}
          >
            {priorityCfg?.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <ListTodo className="h-3 w-3" />
            {tasksDone}/{totalTasks} done
          </span>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progress</span>
              <span className="text-[10px] font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? "#36B37E" : "#0052CC",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}" and all its tasks? This action cannot be undone.`}
        onConfirm={() => {
          onDelete(project.id)
          setShowDeleteConfirm(false)
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
