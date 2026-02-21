import { useState, useRef, useMemo, useCallback } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { projectStorage } from "@/services/projectStorage"
import { useQueryClient } from "@tanstack/react-query"
import { BOARD_COLUMNS, TaskCard } from "@/features/projects/components/ProjectDetail"
import { TaskFormDialog } from "@/features/projects/components/TaskFormDialog"
import type { Task, TaskStatus } from "@/types/project"
import { LayoutDashboard, Plus } from "lucide-react"

interface BoardTask extends Task {
  projectId: string
  projectName: string
}

export default function BoardPage() {
  const { state, dispatch } = useProjectContext()
  const queryClient = useQueryClient()
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const dragTaskRef = useRef<{ task: BoardTask; sourceColumn: TaskStatus } | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null)
  const [createForProject, setCreateForProject] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")

  // Collect all tasks across all projects
  const allTasks = useMemo<BoardTask[]>(() => {
    return state.projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }))
    )
  }, [state.projects])

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return allTasks
    return allTasks.filter((t) => t.projectId === selectedProjectId)
  }, [allTasks, selectedProjectId])

  const tasksByStatus = BOARD_COLUMNS.map((col) => ({
    ...col,
    tasks: filteredTasks.filter((t) => t.status === col.key),
  }))

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    const boardTask = filteredTasks.find((t) => t.id === task.id)
    if (!boardTask) return
    dragTaskRef.current = { task: boardTask, sourceColumn: task.status }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    dragTaskRef.current = null
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnKey)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    dispatch({ type: "LOAD_PROJECTS" })
  }, [queryClient, dispatch])

  const handleDrop = (e: React.DragEvent, targetColumn: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const ref = dragTaskRef.current
    if (!ref) return
    if (ref.sourceColumn === targetColumn) return
    projectStorage.updateTask(ref.task.projectId, ref.task.id, { status: targetColumn })
    refreshData()
    dragTaskRef.current = null
  }

  const handleEditTask = (task: Task) => {
    const boardTask = filteredTasks.find((t) => t.id === task.id)
    if (boardTask) {
      setEditingTask(boardTask)
      setTaskDialogOpen(true)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const boardTask = filteredTasks.find((t) => t.id === taskId)
    if (boardTask) {
      projectStorage.removeTask(boardTask.projectId, taskId)
      refreshData()
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">

      {/* Header */}
      <div className="bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#0052CC] to-[#0065FF]">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#172B4D]">Board</h1>
                <p className="text-sm text-[#6B778C] mt-0.5">
                  {filteredTasks.length} issue{filteredTasks.length !== 1 ? "s" : ""} across{" "}
                  {selectedProjectId === "all"
                    ? `${state.projects.length} projects`
                    : "1 project"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-sm text-[#172B4D] focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] outline-none"
              >
                <option value="all">All projects</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
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
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-6">
        {state.projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutDashboard className="h-12 w-12 text-[#DFE1E6] mb-4" />
            <h3 className="text-base font-medium text-[#172B4D]">No projects yet</h3>
            <p className="text-sm text-[#6B778C] mt-1">
              Create a project first, then add issues to see them here.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 h-full min-h-[400px]">
            {tasksByStatus.map((column) => (
              <div
                key={column.key}
                className={`flex flex-col w-[280px] min-w-[280px] rounded transition-colors ${
                  dragOverColumn === column.key
                    ? "bg-[#E9F2FF] ring-2 ring-[#4C9AFF] ring-inset"
                    : "bg-[#F4F5F7]"
                }`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: column.headerColor }}
                    >
                      {column.label}
                    </span>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DFE1E6] text-[10px] font-bold text-[#42526E]">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {column.tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-xs text-[#A5ADBA]">
                      Drop issues here
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <div key={task.id} onDragEnd={handleDragEnd}>
                        <div className="relative">
                          <TaskCard
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            draggable
                            onDragStart={handleDragStart}
                          />
                          <div className="absolute bottom-1 left-3 text-[9px] text-[#A5ADBA] font-medium">
                            {(task as BoardTask).projectName}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
