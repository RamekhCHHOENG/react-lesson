import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { ProjectStatus, ProjectPriority } from "@/types/project"

interface ProjectFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: ProjectStatus | "all"
  onStatusChange: (value: ProjectStatus | "all") => void
  priorityFilter: ProjectPriority | "all"
  onPriorityChange: (value: ProjectPriority | "all") => void
}

export function ProjectFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={statusFilter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value as ProjectStatus | "all")}
        className="w-full sm:w-[160px]"
      >
        <option value="all">All Statuses</option>
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Select
        value={priorityFilter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onPriorityChange(e.target.value as ProjectPriority | "all")}
        className="w-full sm:w-[160px]"
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </Select>
    </div>
  )
}
