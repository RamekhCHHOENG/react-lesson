import { Minus, Plus, ChevronLeft, ChevronRight, Filter as FilterIcon, Settings2, MoreHorizontal, Search } from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { useProjectContext } from "@/store/project-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { TASK_STATUS_CONFIG } from "@/config"
import { Skeleton } from "@/components/ui/skeleton"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function TimelinePage() {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null

  const epics = project?.tasks.filter((t) => t.issue_type === "epic") ?? []

  if (isLoading) {
    return (
      <JiraWorkspaceFrame tab="timeline">
        <div className="space-y-6">
           <Skeleton className="h-10 w-64" />
           <Skeleton className="h-[600px] w-full" />
        </div>
      </JiraWorkspaceFrame>
    )
  }

  return (
    <JiraWorkspaceFrame tab="timeline">
      <div className="flex flex-col h-full space-y-6">
        {/* Timeline Header */}
        <div className="flex items-center gap-3">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              placeholder="Search timeline"
              className="h-10 w-full rounded-[3px] border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button variant="ghost" className="h-9 text-muted-foreground font-semibold px-2">
             <FilterIcon className="h-4 w-4 mr-2" />
             Filter
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 border border-border rounded-[3px] p-0.5 bg-secondary/20">
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background"><Minus className="h-4 w-4" /></Button>
             <span className="text-[11px] font-bold text-muted-foreground px-2">Months</span>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background"><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center gap-1 opacity-70">
             <Button variant="ghost" size="icon" className="h-8 w-8"><Settings2 className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 border border-border/40 rounded-[3px] overflow-hidden bg-card flex flex-col relative min-h-[600px] shadow-sm">
          {/* Timeline Grid Header */}
          <div className="flex border-b border-border/40 bg-secondary/20 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
            <div className="w-80 p-3 shrink-0 flex items-center justify-between border-r border-border/40 bg-card z-10">
               <span>Task / Epic</span>
               <div className="flex gap-1">
                  <ChevronLeft className="h-3 w-3 cursor-pointer hover:text-foreground" />
                  <ChevronRight className="h-3 w-3 cursor-pointer hover:text-foreground" />
               </div>
            </div>
            <div className="flex-1 flex divide-x divide-border/20">
              {MONTHS.map((month) => (
                <div key={month} className="flex-1 p-3 text-center border-border/10 bg-secondary/10">
                  {month} 2025
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/20 relative">
             <div className="absolute inset-0 flex divide-x divide-border/10 pointer-events-none">
                <div className="w-80 shrink-0" />
                {MONTHS.map(m => <div key={m} className="flex-1" />)}
             </div>

            {epics.map((epic) => (
              <div key={epic.id} className="flex group hover:bg-primary/5 transition-all">
                <div className="w-80 p-4 shrink-0 border-r border-border/40 bg-card z-10 flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-purple-500 shadow-sm" />
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{epic.title}</p>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{epic.issue_key}</span>
                   </div>
                </div>
                <div className="flex-1 relative p-4 group-hover:bg-primary/5 transition-all">
                  <div className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-purple-500 border-2 border-purple-400 shadow-xl flex items-center px-4 overflow-hidden group/bar transition-all hover:scale-[1.02] cursor-pointer" style={{ left: "15%", right: "65%" }}>
                     <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter shadow-sm">{TASK_STATUS_CONFIG[epic.status].label}</span>
                        <Badge className="bg-white/20 text-white text-[9px] h-4 border-none font-bold">4 Feb – 12 Mar</Badge>
                     </div>
                  </div>
                </div>
              </div>
            ))}
            
            {epics.length === 0 && (
               <div className="flex group hover:bg-primary/5 transition-all">
                  <div className="w-80 p-4 shrink-0 border-r border-border/40 bg-card z-10 flex items-center gap-3 opacity-50">
                     <div className="h-6 w-full bg-secondary/50 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 relative p-4 text-center">
                     <p className="text-sm font-bold text-muted-foreground/30 mt-4 italic uppercase tracking-widest">No epics scheduled for this view</p>
                  </div>
               </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border/40 bg-secondary/10 flex items-center justify-between z-10">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-purple-500" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Epic Timeline</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-sm bg-blue-500/20 border border-blue-500" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Sprint Boundary</span>
                </div>
             </div>
             <p className="text-[10px] text-muted-foreground font-medium italic">Projected finish: {formatDate(project?.end_date || new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </JiraWorkspaceFrame>
  )
}