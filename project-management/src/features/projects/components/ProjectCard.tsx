import type { Project } from "@/types/project"
import { PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from "@/config"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ListTodo, Pencil, Trash2, Eye } from "lucide-react"

interface ProjectCardProps {
  project: Project
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const tasksDone = project.tasks.filter((t) => t.status === "done").length
  const totalTasks = project.tasks.length
  const progress = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0
  const statusCfg = PROJECT_STATUS_CONFIG[project.status]
  const priorityCfg = PROJECT_PRIORITY_CONFIG[project.priority]

  return (
    <Card className="group hover:shadow-md transition-all overflow-hidden">
      {/* Top color strip */}
      <div className="h-1" style={{ backgroundColor: statusCfg?.dotColor ?? "hsl(var(--border))" }} />

      <CardContent className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => onView(project.id)}
          >
            {project.name}
          </h3>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(project.id)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(project.id)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(project.id)}>
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
          <Badge variant="secondary" className={statusCfg?.color}>
            <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: statusCfg?.dotColor }} />
            {statusCfg?.label}
          </Badge>
          <Badge variant="secondary" className={priorityCfg?.color}>
            {priorityCfg?.label}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {project.startDate}
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
              <Badge key={tag} variant="outline" className="text-[10px] py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progress</span>
              <span className="text-[10px] font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
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
      </CardContent>
    </Card>
  )
}
