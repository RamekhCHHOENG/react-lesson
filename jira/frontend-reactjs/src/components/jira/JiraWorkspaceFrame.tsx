import type { ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  MoreHorizontal,
  Share2,
  Zap,
  MessageSquare,
  Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectContext } from "@/store/project-context"
import { Button } from "@/components/ui/button"

interface TabConfig {
  id: string
  label: string
  to: string
  icon?: any
}

const TABS: TabConfig[] = [
  { id: "summary", label: "Summary", to: "/summary" },
  { id: "backlog", label: "Backlog", to: "/backlog" },
  { id: "board", label: "Board", to: "/board" },
  { id: "code", label: "Code", to: "/code" },
  { id: "timeline", label: "Timeline", to: "/timeline" },
  { id: "pages", label: "Pages", to: "/pages" },
  { id: "forms", label: "Forms", to: "/forms" },
]

interface JiraWorkspaceFrameProps {
  children: ReactNode
  tab: string
}

export function JiraWorkspaceFrame({ children, tab }: JiraWorkspaceFrameProps) {
  const { selectedProject, projects } = useProjectContext()
  const navigate = useNavigate()
  const location = useLocation()
  const project = selectedProject ?? projects[0] ?? null

  const isSupport = location.pathname.startsWith('/summary') || location.pathname.startsWith('/queues')

  return (
    <div className="flex h-full flex-col bg-background animate-in fade-in duration-300">
      <header className="px-8 pt-6 pb-2 bg-background/50 backdrop-blur-3xl sticky top-0 z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground/80 mb-4 tracking-tighter uppercase opacity-80">
          <span className="hover:text-primary cursor-pointer transition-colors px-1">Spaces</span>
          <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
          
          {isSupport ? (
            <>
              <span className="hover:text-primary cursor-pointer transition-colors px-1">Support</span>
              <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
              <span className="hover:text-primary cursor-pointer transition-colors px-1">Queues</span>
              <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
              <span className="text-foreground/90 px-1 font-black">All open</span>
            </>
          ) : (
             <div className="flex items-center gap-1.5 px-1 hover:text-foreground cursor-pointer transition-colors group">
               <div className="h-4 w-4 rounded-sm bg-orange-500 text-[8px] font-bold text-white flex items-center justify-center shadow-sm">
                 {project?.key?.charAt(0) ?? "M"}
               </div>
               <span className="font-bold">{project?.name ?? "My Software Team"}</span>
               <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          )}
        </div>

        {/* Project Header */}
        <div className="flex items-center justify-between mb-6 group/header">
          <div className="flex items-center gap-3">
             {isSupport ? (
                <div className="h-10 w-10 shrink-0 rounded-[3px] bg-[#00b8d9] flex items-center justify-center shadow-lg shadow-cyan-500/20 transform transition-transform group-hover/header:rotate-12 cursor-pointer">
                   <Zap className="h-6 w-6 text-white" />
                </div>
             ) : (
                <div className="h-10 w-10 shrink-0 rounded-[3px] bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 transform transition-transform group-hover/header:scale-110 active:scale-95 cursor-pointer">
                   <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                      <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                   </svg>
                </div>
             )}
             <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black tracking-tight text-foreground transition-all hover:text-primary cursor-pointer">
                   {isSupport ? "All open" : (project?.name ?? "My Software Team")}
                </h1>
                <div className="flex items-center translate-y-0.5 opacity-60 hover:opacity-100 transition-opacity ml-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary/80 rounded-full"><Star className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary/80 rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-[40px] w-[40px] border border-border/10 hover:bg-secondary/80 transition-all rounded-[3px] shadow-sm"><Share2 className="h-4 w-4 text-muted-foreground" /></Button>
             <Button variant="ghost" size="icon" className="h-[40px] w-[40px] border border-border/10 hover:bg-secondary/80 transition-all rounded-[3px] shadow-sm"><Zap className="h-4 w-4 text-muted-foreground" /></Button>
             <Button variant="ghost" size="icon" className="h-[40px] w-[40px] border border-border/10 hover:bg-secondary/80 transition-all rounded-[3px] shadow-sm"><MessageSquare className="h-4 w-4 text-muted-foreground" /></Button>
             <Button variant="ghost" size="icon" className="h-[40px] w-[40px] border border-border/10 hover:bg-secondary/80 transition-all rounded-[3px] shadow-sm"><Maximize2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-border/50 translate-y-[1px] bg-background">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(t.to)}
              className={cn(
                "relative px-4 py-3 text-[13px] font-bold transition-all duration-200 outline-none tracking-wide",
                tab === t.id
                  ? "text-primary border-b-[3px] border-primary z-10"
                  : "text-muted-foreground/80 hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <span className="relative z-10">{t.label}</span>
              {tab === t.id && (
                 <div className="absolute inset-0 bg-primary/5 rounded-t-sm" />
              )}
            </button>
          ))}
          <button className="px-4 py-3 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/30">
             <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pt-6 custom-scrollbar bg-background">
        <div className="max-w-[1600px] mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  )
}