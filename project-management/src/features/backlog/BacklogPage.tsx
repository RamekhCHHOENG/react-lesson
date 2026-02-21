import { useState, useMemo, useCallback } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { projectStorage } from "@/services/projectStorage"
import { formatDate } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { TaskFormDialog } from "@/features/projects/components/TaskFormDialog"
import type { Task, TaskStatus } from "@/types/project"
import {
  CheckSquare,
  Search,
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Plus,
} from "lucide-react"

interface BacklogTask extends Task {
  projectId: string
  projectName: string
}

function TaskRow({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: BacklogTask
  onEdit: (task: BacklogTask) => void
  onDelete: (task: BacklogTask) => void
  onStatusChange: (task: BacklogTask, status: TaskStatus) => void
}) {
  return (
    <div className="grid grid-cols-[24px_1fr_120px_100px_100px_100px_80px] gap-3 px-4 py-2.5 border-b border-[#DFE1E6] hover:bg-[#FAFBFC] transition-colors group items-center">
      <div className="flex items-center justify-center">
        <GripVertical className="h-3.5 w-3.5 text-[#C1C7D0] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
      </div>
      <div className="min-w-0">
        <span className="text-sm font-medium text-[#172B4D] truncate block">
          {task.title}
        </span>
        {task.description && (
          <p className="text-xs text-[#6B778C] truncate mt-0.5">{task.description}</p>
        )}
      </div>
      <div>
        <span className="text-xs text-[#6B778C] bg-[#F4F5F7] rounded px-2 py-1 truncate block text-center">
          {task.projectName}
        </span>
      </div>
      <div>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
          className="text-[10px] font-semibold uppercase rounded px-1.5 py-0.5 border-0 cursor-pointer bg-transparent focus:ring-1 focus:ring-[#4C9AFF] outline-none w-full"
        >
          <option value="todo">TO DO</option>
          <option value="in-progress">IN PROGRESS</option>
          <option value="review">IN REVIEW</option>
          <option value="done">DONE</option>
        </select>
      </div>
      <div>
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00875A] text-white text-[9px] font-bold shrink-0">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-[#42526E] truncate">{task.assignee}</span>
          </div>
        ) : (
          <span className="text-xs text-[#A5ADBA]">Unassigned</span>
        )}
      </div>
      <div>
        {task.dueDate ? (
          <span className="flex items-center gap-1 text-xs text-[#42526E]">
            <Calendar className="h-3 w-3 text-[#6B778C]" />
            {formatDate(task.dueDate, "short")}
          </span>
        ) : (
          <span className="text-xs text-[#A5ADBA]">—</span>
        )}
      </div>
      <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="flex items-center justify-center h-6 w-6 rounded hover:bg-[#EBECF0] text-[#6B778C] transition-colors"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="flex items-center justify-center h-6 w-6 rounded hover:bg-[#FFEBE6] text-[#6B778C] hover:text-[#DE350B] transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export default function BacklogPage() {
  const { state, dispatch } = useProjectContext()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [editingTask, setEditingTask] = useState<BacklogTask | null>(null)
  const [createForProject, setCreateForProject] = useState<string | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    todo: true,
    "in-progress": true,
    review: true,
    done: false,
  })

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    dispatch({ type: "LOAD_PROJECTS" })
  }, [queryClient, dispatch])

  const allTasks = useMemo<BacklogTask[]>(() => {
    return state.projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }))
    )
  }, [state.projects])

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchProject = selectedProjectId === "all" || t.projectId === selectedProjectId
      return matchSearch && matchStatus && matchProject
    })
  }, [allTasks, search, statusFilter, selectedProjectId])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, { label: string; color: string; tasks: BacklogTask[] }> = {
      todo: { label: "TO DO", color: "#42526E", tasks: [] },
      "in-progress": { label: "IN PROGRESS", color: "#0052CC", tasks: [] },
      review: { label: "IN REVIEW", color: "#6554C0", tasks: [] },
      done: { label: "DONE", color: "#00875A", tasks: [] },
    }
    filteredTasks.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].tasks.push(t)
      }
    })
    return groups
  }, [filteredTasks])

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleStatusChange = (task: BacklogTask, status: TaskStatus) => {
    projectStorage.updateTask(task.projectId, task.id, { status })
    refreshData()
  }

  const handleDelete = (task: BacklogTask) => {
    projectStorage.removeTask(task.projectId, task.id)
    refreshData()
  }

  const backlogCount = allTasks.filter((t) => t.status === "todo").length

  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">

      {/* Header */}
      <div className="bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#42526E] to-[#6B778C]">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#172B4D]">Backlog</h1>
                <p className="text-sm text-[#6B778C] mt-0.5">
                  {backlogCount} issue{backlogCount !== 1 ? "s" : ""} in backlog &middot;{" "}
                  {allTasks.length} total
                </p>
              </div>
            </div>
            {state.projects.length > 0 && (
              <button
                onClick={() => {
                  const targetProject = selectedProjectId !== "all"
                    ? selectedProjectId
                    : state.projects[0]?.id
                  if (targetProject) {
                    setCreateForProject(targetProject)
                    setEditingTask(null)
                    setTaskDialogOpen(true)
                  }
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create issue
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 rounded px-2.5 h-8 border border-[#DFE1E6] bg-white focus-within:border-[#4C9AFF] w-[240px]">
              <Search className="h-3.5 w-3.5 text-[#6B778C] shrink-0" />
              <input
                className="bg-transparent border-0 outline-none text-sm text-[#172B4D] placeholder:text-[#6B778C] w-full"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
              className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-sm text-[#172B4D] focus:border-[#4C9AFF] outline-none"
            >
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </select>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-sm text-[#172B4D] focus:border-[#4C9AFF] outline-none"
            >
              <option value="all">All projects</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Backlog list */}
      <div className="flex-1 overflow-auto p-6">
        {allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckSquare className="h-12 w-12 text-[#DFE1E6] mb-4" />
            <h3 className="text-base font-medium text-[#172B4D]">Backlog is empty</h3>
            <p className="text-sm text-[#6B778C] mt-1">
              Create issues in your projects to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([key, group]) => (
              <div key={key} className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleSection(key)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#FAFBFC] border-b border-[#DFE1E6] hover:bg-[#F4F5F7] transition-colors"
                >
                  {expandedSections[key] ? (
                    <ChevronDown className="h-4 w-4 text-[#6B778C]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#6B778C]" />
                  )}
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </span>
                  <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#DFE1E6] text-[10px] font-bold text-[#42526E] px-1.5">
                    {group.tasks.length}
                  </span>
                </button>

                {/* Tasks */}
                {expandedSections[key] && (
                  <div>
                    {/* Column headers */}
                    <div className="grid grid-cols-[24px_1fr_120px_100px_100px_100px_80px] gap-3 px-4 py-1.5 bg-[#FAFBFC] border-b border-[#DFE1E6] text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider">
                      <span />
                      <span>Issue</span>
                      <span>Project</span>
                      <span>Status</span>
                      <span>Assignee</span>
                      <span>Due Date</span>
                      <span className="text-right">Actions</span>
                    </div>
                    {group.tasks.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-xs text-[#A5ADBA]">
                        No issues
                      </div>
                    ) : (
                      group.tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onEdit={(t) => {
                            setEditingTask(t)
                            setTaskDialogOpen(true)
                          }}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(null)
          setCreateForProject(null)
        }}
        onSubmit={(data) => {
          if (editingTask) {
            projectStorage.updateTask(editingTask.projectId, editingTask.id, data)
          } else if (createForProject) {
            projectStorage.addTask(createForProject, data)
          }
          refreshData()
          setEditingTask(null)
          setCreateForProject(null)
        }}
        initialData={editingTask ?? undefined}
        title={editingTask ? "Edit issue" : "Create issue"}
      />
    </div>
  )
}
