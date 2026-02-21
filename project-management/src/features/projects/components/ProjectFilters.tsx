import { Search } from "lucide-react"
import type { ProjectStatus, ProjectPriority } from "@/types/project"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        onValueChange={(value) => onStatusChange(value as ProjectStatus | "all")}
      >
        <SelectTrigger className="h-8 w-full sm:w-[150px] text-[13px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* priority */}
      <Select
        value={priorityFilter}
        onValueChange={(value) => onPriorityChange(value as ProjectPriority | "all")}
      >
        <SelectTrigger className="h-8 w-full sm:w-[150px] text-[13px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
