import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, FileText } from "lucide-react"
import { ISSUE_TYPE_CONFIG, TASK_STATUS_CONFIG } from "@/config"
import type { Task } from "@/types"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate()
  const { data: projects } = useProjects()
  const [query, setQuery] = useState("")

  const allTasks: (Task & { projectName: string })[] =
    projects?.flatMap((p) =>
      p.tasks.map((t) => ({ ...t, project_id: p.id, projectName: p.name }))
    ) ?? []

  const filteredProjects =
    projects?.filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.key.toLowerCase().includes(query.toLowerCase())
    ) ?? []

  const filteredTasks = allTasks.filter(
    (t) =>
      !query ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.issue_key.toLowerCase().includes(query.toLowerCase()) ||
      t.assignee?.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (type: "project" | "task", id: string, projectId?: string) => {
    onOpenChange(false)
    setQuery("")
    if (type === "project") {
      navigate(`/projects/${id}`)
    } else {
      navigate(`/projects/${projectId}/tasks/${id}`)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search projects, tasks, people..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredProjects.length > 0 && (
          <CommandGroup heading="Projects">
            {filteredProjects.slice(0, 5).map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => handleSelect("project", project.id)}
                className="flex items-center gap-2"
              >
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-[10px] font-mono">
                  {project.key}
                </Badge>
                <span>{project.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{project.tasks.length} tasks</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredProjects.length > 0 && filteredTasks.length > 0 && <CommandSeparator />}

        {filteredTasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {filteredTasks.slice(0, 10).map((task) => {
              const typeConfig = ISSUE_TYPE_CONFIG[task.issue_type]
              const statusConfig = TASK_STATUS_CONFIG[task.status]
              return (
                <CommandItem
                  key={task.id}
                  onSelect={() => handleSelect("task", task.id, task.project_id)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">{task.issue_key}</span>
                  {typeConfig && (
                    <Badge variant="secondary" className={`${typeConfig.bgColor} ${typeConfig.color} text-[10px]`}>
                      {typeConfig.label}
                    </Badge>
                  )}
                  <span className="flex-1 truncate">{task.title}</span>
                  {statusConfig && (
                    <Badge variant="secondary" className={`${statusConfig.bgColor} ${statusConfig.color} text-[10px]`}>
                      {statusConfig.label}
                    </Badge>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export function useSearchShortcut() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}
