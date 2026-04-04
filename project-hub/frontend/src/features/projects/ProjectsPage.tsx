import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { useProjectContext } from "@/store/project-context"
import { PROJECT_STATUS_CONFIG } from "@/config"
import { cn } from "@/lib/utils"
import type { Project } from "@/types"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  FolderKanban,
  Star,
  MoreHorizontal
} from "lucide-react"

import ProjectFormDialog from "@/features/projects/components/ProjectFormDialog"

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const { selectProject } = useProjectContext()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    if (!search) return projects
    const q = search.toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
  }, [projects, search])

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center bg-background border-b border-border/40 pb-8">
           <Skeleton className="h-10 w-64" />
           <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8 pb-20 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1.5 font-medium">Browse and manage all your active projects in one place.</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="h-10 bg-primary text-white font-bold rounded-[3px] px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
             <Plus className="mr-2 h-4 w-4" />
             Create project
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-secondary/10 p-4 rounded-[3px]">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or key"
              className="h-10 w-full rounded-[3px] border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" className="h-9 px-3 text-xs font-bold text-muted-foreground hover:bg-background">Recent</Button>
             <Button variant="ghost" className="h-9 px-3 text-xs font-bold text-muted-foreground hover:bg-background">Starred</Button>
             <div className="h-4 w-px bg-border/40 mx-2" />
             <Button variant="ghost" size="icon" className="h-9 w-9 opacity-50"><FolderKanban className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => { selectProject(project.id); navigate('/board') }} />
          ))}
          {filteredProjects.length === 0 && (
             <div className="col-span-full py-32 text-center">
                <FolderKanban className="h-16 w-16 text-muted-foreground/10 mx-auto mb-6" />
                <h3 className="text-lg font-bold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or create a new project to get started.</p>
             </div>
          )}
        </div>
      </div>

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const status = PROJECT_STATUS_CONFIG[project.status] ?? { label: project.status, color: "text-gray-700", bgColor: "bg-gray-100" }
  const done = project.tasks.filter((t) => t.status === "done").length
  const total = project.tasks.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Card 
       onClick={onClick}
       className="group relative h-full jira-panel border-none bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
       <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 group-hover:h-1.5 transition-all" />
       
       <CardHeader className="pb-4 border-none">
          <div className="flex justify-between items-start mb-4">
             <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                   <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                </svg>
             </div>
             <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background/80"><Star className="h-4 w-4 text-muted-foreground/30 hover:text-yellow-500" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background/80"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Button>
             </div>
          </div>
          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{project.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{project.key}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
             <span className="text-[11px] font-bold text-muted-foreground uppercase">{project.type || 'SOFTWARE'}</span>
          </div>
       </CardHeader>

       <CardContent className="pt-0 space-y-6">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
             <span className={cn("px-2 py-0.5 rounded-[3px]", status.bgColor, status.color)}>{status.label}</span>
             <span className="flex items-center gap-1.5">{total} items</span>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                <span>Progress</span>
                <span>{progress}%</span>
             </div>
             <Progress value={progress} className="h-1.5 rounded-full bg-background" />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border/20">
             <div className="flex -space-x-1.5">
                <Avatar className="h-6 w-6 ring-2 ring-background border-none">
                   <AvatarFallback className="bg-orange-500 text-[8px] text-white font-bold">RE</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 ring-2 ring-background border-none">
                   <AvatarFallback className="bg-blue-500 text-[8px] text-white font-bold">MK</AvatarFallback>
                </Avatar>
             </div>
             <div className="text-[10px] font-medium text-muted-foreground italic">Updated 2d ago</div>
          </div>
       </CardContent>
    </Card>
  )
}
