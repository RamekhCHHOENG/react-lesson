import { Search } from "lucide-react"
import type { ProjectStatus, ProjectPriority } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* search */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 text-[13px]"
        />
      </div>

      {/* status */}
      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus | "all")}
        className="h-8 w-full sm:w-[150px] text-[13px]"
      >
        <option value="all">All Statuses</option>
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      {/* priority */}
      <Select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value as ProjectPriority | "all")}
        className="h-8 w-full sm:w-[150px] text-[13px]"
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
