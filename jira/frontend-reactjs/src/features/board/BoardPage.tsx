import { useState, useCallback, useRef } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Bug,
  CheckSquare,
  ChevronsUp,
  GitBranch,
  Plus,
  Search,
  Zap,
  MoreHorizontal,
  Settings2,
  Filter as FilterIcon,
  Table as TableIcon,
  X
} from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { TaskDetailDrawer } from "@/components/shared/TaskDetailDrawer"
import { useProjectContext } from "@/store/project-context"
import { useUpdateTask, useCreateTask } from "@/hooks/useTasks"
import { cn } from "@/lib/utils"
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import type { Task, TaskStatus } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface ColumnDef {
  key: string
  title: string
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "todo", title: "TO DO" },
  { key: "in-progress", title: "IN PROGRESS" },
  { key: "review", title: "IN REVIEW" },
  { key: "done", title: "DONE" },
]

const ISSUE_TYPE_ICONS: Record<string, any> = {
  bug: Bug,
  story: BookOpen,
  task: CheckSquare,
  epic: Zap,
  subtask: GitBranch,
}

const PRIORITY_ICONS: Record<string, any> = {
  urgent: ChevronsUp,
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
}

export default function BoardPage() {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()
  const [query, setQuery] = useState("")
  const [showCreateInline, setShowCreateInline] = useState<string | null>(null)
  const [inlineTitle, setInlineTitle] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>(DEFAULT_COLUMNS)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const addColumnInputRef = useRef<HTMLInputElement>(null)

  const project = selectedProject ?? projects[0] ?? null

  const handleAddColumn = () => {
    const title = newColumnTitle.trim()
    if (!title) return
    const key = title.toLowerCase().replace(/\s+/g, "-")
    if (columnDefs.some((c) => c.key === key)) return
    setColumnDefs((prev) => [...prev, { key, title: title.toUpperCase() }])
    setNewColumnTitle("")
    setShowAddColumn(false)
  }

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !project) return
      const newStatus = result.destination.droppableId
      const taskId = result.draggableId
      if (newStatus === result.source.droppableId) return

      updateTask.mutate({
        projectId: project.id,
        taskId,
        data: { status: newStatus as TaskStatus },
      })
    },
    [project, updateTask],
  )

  const handleCreateInline = async (status: string) => {
    if (!project || !inlineTitle.trim()) return
    await createTask.mutateAsync({
      projectId: project.id,
      data: {
        title: inlineTitle,
        status: status,
        issue_type: "task",
        priority: "medium"
      }
    })
    setInlineTitle("")
    setShowCreateInline(null)
  }

  if (isLoading) {
    return (
      <JiraWorkspaceFrame tab="board">
        <div className="space-y-6">
           <Skeleton className="h-10 w-64" />
           <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-72 flex-shrink-0 space-y-4">
                   <Skeleton className="h-6 w-32" />
                   <Skeleton className="h-[400px] w-full rounded-[3px]" />
                </div>
              ))}
           </div>
        </div>
      </JiraWorkspaceFrame>
    )
  }

  const tasks = (project?.tasks ?? []).filter((task) => {
    if (query) {
      const q = query.toLowerCase()
      if (!task.title.toLowerCase().includes(q) && !task.issue_key?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const columns = columnDefs.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }))

  return (
    <JiraWorkspaceFrame tab="board">
      <div className="space-y-6 flex flex-col h-full bg-background/50">
        <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md p-1 rounded-[3px]">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search board"
              className="h-9 w-full rounded-[3px] border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="flex -space-x-1.5 ml-2">
             <Avatar className="h-8 w-8 ring-2 ring-background border-none shadow-sm">
                <AvatarFallback className="bg-blue-600 text-[10px] text-white font-bold">JD</AvatarFallback>
             </Avatar>
             <Avatar className="h-8 w-8 ring-2 ring-background border-none shadow-sm">
                <AvatarFallback className="bg-orange-500 text-[10px] text-white font-bold">RE</AvatarFallback>
             </Avatar>
             <button className="h-8 w-8 rounded-full ring-2 ring-background border-none bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
             </button>
          </div>

          <Button variant="ghost" className="h-9 text-muted-foreground font-bold px-3 hover:bg-secondary/50">
             <FilterIcon className="h-4 w-4 mr-2" />
             Filter
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><TableIcon className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><Settings2 className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin flex-1 min-h-0">
            {columns.map((column) => (
              <Droppable key={column.key} droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-shrink-0 w-72 rounded-[3px] bg-secondary/20 p-2 flex flex-col h-fit border border-transparent transition-all",
                      snapshot.isDraggingOver && "bg-secondary/40 border-primary/10 shadow-inner"
                    )}
                  >
                    <div className="flex items-center justify-between px-2 py-2 mb-2 group/column">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">{column.title}</span>
                          <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-secondary/80 text-[10px] font-bold flex items-center justify-center text-muted-foreground border border-border/10">{column.tasks.length}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/column:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>

                    <div className="space-y-2 flex-1 scrollbar-none overflow-y-auto px-0.5">
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => {
                                setSelectedTask(task)
                                setDrawerOpen(true)
                              }}
                            >
                              <BoardCard task={task} isDragging={dragSnapshot.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {showCreateInline === column.key ? (
                         <div className="bg-background border-2 border-primary p-3 rounded-[3px] shadow-2xl animate-in zoom-in-95 duration-150 ring-4 ring-primary/5">
                            <textarea 
                              autoFocus 
                              value={inlineTitle}
                              rows={2}
                              onChange={(e) => setInlineTitle(e.target.value)}
                              onKeyDown={(e) => {
                                 if (e.key === 'Escape') setShowCreateInline(null)
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                   e.preventDefault()
                                   handleCreateInline(column.key)
                                 }
                              }}
                              placeholder="What needs to be done?"
                              className="w-full bg-transparent text-sm text-foreground outline-none mb-3 resize-none font-medium placeholder:font-normal" 
                            />
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                  <div className="h-5 w-5 bg-blue-600 rounded-sm flex items-center justify-center">
                                     <CheckSquare className="h-3 w-3 text-white" />
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold" onClick={() => setShowCreateInline(null)}>Cancel</Button>
                                  <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-primary text-white" onClick={() => handleCreateInline(column.key)}>Create</Button>
                               </div>
                            </div>
                         </div>
                      ) : (
                         <button 
                           onClick={() => setShowCreateInline(column.key)}
                           className="w-full p-2.5 flex items-center gap-2.5 text-sm text-muted-foreground hover:bg-secondary/40 rounded-[3px] transition-all group/create opacity-60 hover:opacity-100"
                         >
                            <Plus className="h-4 w-4 group-hover/create:text-primary transition-colors" />
                            <span className="font-medium">Create issue</span>
                         </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

            {/* Add New Column */}
            {showAddColumn ? (
              <div className="flex-shrink-0 w-72 rounded-[3px] bg-secondary/20 p-3 border border-primary/20 h-fit animate-in slide-in-from-right-5 duration-200">
                <input
                  ref={addColumnInputRef}
                  autoFocus
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn()
                    if (e.key === "Escape") {
                      setShowAddColumn(false)
                      setNewColumnTitle("")
                    }
                  }}
                  placeholder="Column name..."
                  className="w-full h-9 rounded-[3px] border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-primary text-white" onClick={handleAddColumn}>
                    Add
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowAddColumn(false); setNewColumnTitle("") }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex-shrink-0 w-72 h-12 rounded-[3px] bg-secondary/10 border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-secondary/20 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group"
              >
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Add column
              </button>
            )}
          </div>
        </DragDropContext>
      </div>

      <TaskDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        task={selectedTask}
        projectId={project?.id ?? ""}
      />
    </JiraWorkspaceFrame>
  )
}

function BoardCard({ task, isDragging }: { task: Task; isDragging: boolean }) {
  const TypeIcon = ISSUE_TYPE_ICONS[task.issue_type] || CheckSquare
  const PriorityIcon = PRIORITY_ICONS[task.priority] || ArrowRight
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority as keyof typeof TASK_PRIORITY_CONFIG] || TASK_PRIORITY_CONFIG.medium
  const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.todo
  const typeCfg = ISSUE_TYPE_CONFIG[task.issue_type as keyof typeof ISSUE_TYPE_CONFIG] || ISSUE_TYPE_CONFIG.task

  return (
    <div
      className={cn(
        "bg-background border border-border/50 rounded-[3px] p-3 shadow-sm hover:border-primary/50 transition-all cursor-pointer select-none group/card",
        isDragging && "shadow-2xl ring-4 ring-primary/10 -rotate-1 z-50 scale-105 border-primary/40 bg-card outline-none"
      )}
    >
      <p className="text-[14px] text-foreground font-semibold mb-4 leading-tight group-hover/card:text-primary transition-colors">{task.title}</p>
      
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="h-4 w-4 flex items-center justify-center shrink-0">
               <TypeIcon className="h-4 w-4" style={{ color: typeCfg.hex }} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover/card:text-primary transition-colors tracking-tight uppercase">{task.issue_key || 'DEV-XX'}</span>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="h-4 w-4 flex items-center justify-center">
               <PriorityIcon className="h-3.5 w-3.5" style={{ color: priorityCfg.hex }} />
            </div>
            <Avatar className="h-6 w-6 ring-2 ring-background border-none shadow-sm">
               <AvatarFallback className="bg-orange-500 text-[8px] text-white font-bold">RE</AvatarFallback>
            </Avatar>
         </div>
      </div>
      
      {/* Small status line */}
      <div className="mt-3 flex items-center justify-between opacity-0 group-hover/card:opacity-100 transition-opacity">
         <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-[2px]", statusCfg.bgColor, statusCfg.color)}>
            {statusCfg.label}
         </span>
      </div>
    </div>
  )
}

