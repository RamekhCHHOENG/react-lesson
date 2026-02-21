import { useState } from "react"
import type { Project, Task, TaskFormData, TaskStatus } from "@/types/project"
import { StatusBadge, PriorityBadge } from "./StatusBadge"
import { TaskList } from "./TaskList"
import { TaskFormDialog } from "./TaskFormDialog"
import { useTasks } from "@/hooks/useProjects"
import { ArrowLeft, Plus, Calendar, Tag, Pencil, Trash2 } from "lucide-react"
import { TASK_STATUS_CONFIG } from "@/config"

export const BOARD_COLUMNS: { key: TaskStatus; label: string; headerColor: string }[] = [
  { key: "todo", label: "TO DO", headerColor: "#6B778C" },
  { key: "in-progress", label: "IN PROGRESS", headerColor: "#0065FF" },
  { key: "review", label: "IN REVIEW", headerColor: "#6554C0" },
  { key: "done", label: "DONE", headerColor: "#36B37E" },
]

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, draggable, onDragStart }: TaskCardProps) {
  const statusConfig = TASK_STATUS_CONFIG[task.status]
  return (
    <div
      className="bg-white rounded border border-[#DFE1E6] p-3 hover:bg-[#F4F5F7] cursor-pointer shadow-sm"
      draggable={draggable}
      onDragStart={draggable && onDragStart ? (e) => onDragStart(e, task) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#172B4D] truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-[#6B778C] mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-[#EBECF0]">
            <Pencil className="h-3 w-3 text-[#6B778C]" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded hover:bg-[#FFEBE6]">
            <Trash2 className="h-3 w-3 text-[#DE350B]" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ backgroundColor: statusConfig?.dotColor + "20", color: statusConfig?.dotColor }}
        >
          {statusConfig?.label ?? task.status}
        </span>
      </div>
    </div>
  )
}

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onEdit: () => void
}

export function ProjectDetail({ project, onBack, onEdit }: ProjectDetailProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { addTask, updateTask, deleteTask } = useTasks(project.id)

  const handleAddTask = (data: TaskFormData) => {
    addTask(data)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return
    updateTask({ taskId: editingTask.id, data })
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  const tasksDone = project.tasks.filter((t) => t.status === "done").length
  const progress = project.tasks.length > 0 ? Math.round((tasksDone / project.tasks.length) * 100) : 0

  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">
      {/* header */}
      <div className="bg-white border-b border-[#DFE1E6] px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#EBECF0] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#42526E]" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-[#172B4D] truncate">{project.name}</h2>
            <p className="text-[13px] text-[#6B778C] mt-0.5">{project.description || "No description"}</p>
          </div>
          <button
            onClick={onEdit}
            className="h-8 px-3 rounded bg-[#FAFBFC] border border-[#DFE1E6] text-[13px] font-medium text-[#42526E] hover:bg-[#EBECF0] transition-colors"
          >
            Edit Project
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* meta cards */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="bg-white rounded border border-[#DFE1E6] p-4">
            <p className="text-[11px] text-[#6B778C] font-medium mb-1">Status</p>
            <StatusBadge status={project.status} />
          </div>
          <div className="bg-white rounded border border-[#DFE1E6] p-4">
            <p className="text-[11px] text-[#6B778C] font-medium mb-1">Priority</p>
            <PriorityBadge priority={project.priority} />
          </div>
          <div className="bg-white rounded border border-[#DFE1E6] p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-[#6B778C] font-medium">Progress</p>
              <span className="text-sm font-bold text-[#172B4D]">{progress}%</span>
            </div>
            <div className="w-full bg-[#DFE1E6] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? "#36B37E" : "#0052CC",
                }}
              />
            </div>
          </div>
        </div>

        {/* dates & tags */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[13px] text-[#6B778C]">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {project.startDate} → {project.endDate || "No end date"}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-[#6B778C]" />
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-[#DEEBFF] px-2 py-0.5 text-[11px] font-medium text-[#0052CC]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* tasks section */}
        <div className="bg-white rounded border border-[#DFE1E6]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6]">
            <h3 className="text-sm font-semibold text-[#172B4D]">Tasks ({project.tasks.length})</h3>
            <button
              onClick={() => {
                setEditingTask(null)
                setTaskDialogOpen(true)
              }}
              className="flex items-center gap-1 h-7 px-2.5 rounded bg-[#0052CC] text-white text-[12px] font-medium hover:bg-[#0065FF] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>
          <div className="p-4">
            <TaskList tasks={project.tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
          </div>
        </div>
      </div>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialData={editingTask ?? undefined}
        title={editingTask ? "Edit Task" : "New Task"}
      />
    </div>
  )
}
