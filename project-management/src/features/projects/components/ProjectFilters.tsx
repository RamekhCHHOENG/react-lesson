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

const selectClass =
  "h-8 rounded border border-[#DFE1E6] bg-[#FAFBFC] px-2.5 text-[13px] text-[#172B4D] outline-none focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"

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
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B778C]" />
        <input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`${selectClass} w-full pl-8`}
        />
      </div>

      {/* status */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus | "all")}
        className={`${selectClass} w-full sm:w-[150px]`}
      >
        <option value="all">All Statuses</option>
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* priority */}
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value as ProjectPriority | "all")}
        className={`${selectClass} w-full sm:w-[150px]`}
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>
  )
}
