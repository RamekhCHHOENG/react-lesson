import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search, Star, MoreHorizontal, X, ChevronLeft, ChevronRight,
  LayoutGrid, ClipboardList, Briefcase, ListTodo, Kanban,
  Timer,
} from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useProjectContext } from "@/store/project-context"
import { useAuth } from "@/store/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import ProjectFormDialog from "@/features/projects/components/ProjectFormDialog"

// ── Templates shown in right panel ────────────────────────────────────────

const TEMPLATES = [
  { name: "Work requests", desc: "Quickly manage incoming requests", icon: ClipboardList, color: "bg-purple-600" },
  { name: "Kanban", desc: "Visualize your work on a board", icon: Kanban, color: "bg-blue-600" },
  { name: "Scrum", desc: "Deliver work in short time blocks", icon: Timer, color: "bg-blue-700" },
  { name: "Personal tasks", desc: "Create your to-do list", icon: ListTodo, color: "bg-orange-500" },
  { name: "Business project", desc: "Manage tasks with due dates", icon: Briefcase, color: "bg-blue-600" },
  { name: "Top-level planning", desc: "Monitor work from many projects", icon: LayoutGrid, color: "bg-purple-700", premium: true },
]

// ── Filter options ────────────────────────────────────────────────────────

export default function SpacesPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const { selectProject } = useProjectContext()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [showTemplates, setShowTemplates] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const [filterApp] = useState("all")
  const [currentPage] = useState(1)

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    let filtered = projects
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
      )
    }
    return filtered
  }, [projects, search, filterApp])

  const getProjectType = (p: { key: string; name: string }) => {
    if (p.key === "SUP" || p.name.toLowerCase().includes("support")) return "Service management"
    return "Team-managed software"
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-in fade-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      <div className="flex">
        {/* Main content */}
        <div className="flex-1 p-8 pb-20">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Spaces</h1>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setFormOpen(true)}
                  className="h-9 bg-[#0c66e4] hover:bg-[#0055cc] px-5 text-sm font-bold text-white rounded-[3px] shadow-sm"
                >
                  Create space
                </Button>
                <Button
                  variant={showTemplates ? "default" : "outline"}
                  className={cn(
                    "h-9 px-5 text-sm font-bold rounded-[3px]",
                    showTemplates && "bg-[#0c66e4] hover:bg-[#0055cc] text-white",
                  )}
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  Templates
                </Button>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-4">
              <div className="relative group w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spaces"
                  className="h-10 w-full rounded-[3px] border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-border/40 rounded-[3px] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_100px_180px_180px_120px_50px] items-center px-4 py-3 bg-secondary/20 border-b border-border/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center justify-center">
                  <Star className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                  Name <span className="text-muted-foreground/50">↓</span>
                </div>
                <div>Key</div>
                <div>Type</div>
                <div>Lead</div>
                <div>Space URL</div>
                <div />
              </div>

              {/* Table Body */}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-[40px_1fr_100px_180px_180px_120px_50px] items-center px-4 py-3 border-b border-border/20 hover:bg-secondary/20 transition-colors group/row cursor-pointer"
                  onClick={() => {
                    selectProject(project.id)
                    navigate("/board")
                  }}
                >
                  <div className="flex items-center justify-center">
                    <button
                      className="text-muted-foreground/30 hover:text-yellow-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(project.id)
                      }}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          starredIds.has(project.id) && "fill-yellow-400 text-yellow-400",
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-[3px] text-[10px] font-bold text-white shadow-sm shrink-0",
                      project.key === "SUP" ? "bg-red-500" : "bg-orange-500",
                    )}>
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-primary hover:underline truncate">
                      {project.name}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground font-medium">{project.key}</div>

                  <div className="text-sm text-muted-foreground">{getProjectType(project)}</div>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user ? `https://avatar.vercel.sh/${user.email}.png` : undefined} />
                      <AvatarFallback className="bg-orange-600 text-[8px] font-bold text-white">
                        {getInitials(user?.full_name ?? "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{user?.full_name ?? "Unknown"}</span>
                  </div>

                  <div className="text-sm text-muted-foreground font-mono">...</div>

                  <div className="flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button className="h-7 w-7 rounded-[3px] flex items-center justify-center hover:bg-secondary transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No spaces found matching your search.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 text-sm font-bold bg-primary/10 text-primary border-primary/30">
                {currentPage}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className="w-[320px] border-l border-border/40 bg-background p-6 shrink-0 animate-in slide-in-from-right-5 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="h-7 w-7 rounded-[3px] flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Preview a template for your next space</p>

            <div className="space-y-1">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  className="w-full flex items-center gap-3 p-3 rounded-[3px] hover:bg-secondary/60 transition-colors text-left group/tmpl"
                  onClick={() => setFormOpen(true)}
                >
                  <div className={cn("h-10 w-10 rounded-[3px] flex items-center justify-center shrink-0 shadow-sm", tmpl.color)}>
                    <tmpl.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{tmpl.name}</span>
                      {tmpl.premium && (
                        <span className="text-[9px] font-bold bg-yellow-400/20 text-yellow-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tmpl.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button className="mt-4 text-sm font-semibold text-primary hover:underline">
              More templates
            </button>
          </div>
        )}
      </div>

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
