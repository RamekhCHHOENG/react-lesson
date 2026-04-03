import { ChevronLeft, ChevronRight, LayoutDashboard, Clock, Star, LayoutGrid, Filter, LayoutPanelLeft, Target, Users, MoreHorizontal, ExternalLink, Settings, Sparkles, Plus, Hash } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useProjectContext } from "@/store/project-context"
import { ProjectHubLogo } from "@/components/shared/ProjectHubLogo"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onCreateClick?: () => void
}

export function Sidebar({ collapsed, onToggle, onCreateClick }: SidebarProps) {
  const { selectedProject, projects, selectProject } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null
  const location = useLocation()

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebarExpanded") || "{}")
    } catch {
      return {}
    }
  })

  const toggleExpand = (key: string) => {
    const next = { ...expanded, [key]: expanded[key] === undefined ? false : !expanded[key] }
    setExpanded(next)
    localStorage.setItem("sidebarExpanded", JSON.stringify(next))
  }
  
  const isSupportActive = location.pathname.startsWith('/summary') || location.pathname.startsWith('/queues')
  const isQueuesActive = location.pathname.includes('/queues')

  // Auto-expand if navigating directly
  useEffect(() => {
    if (isSupportActive && expanded["support"] === undefined) toggleExpand("support")
    if (isQueuesActive && expanded["queues"] === undefined) toggleExpand("queues")
  }, [location.pathname])
  
  const [width, setWidth] = useState(() => {
    return parseInt(localStorage.getItem("sidebarWidth") || "256", 10)
  })
  const isResizing = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      let newWidth = e.clientX
      if (newWidth < 200) newWidth = 200
      if (newWidth > 480) newWidth = 480
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false
        localStorage.setItem("sidebarWidth", width.toString())
        document.body.style.cursor = 'default'
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [width])

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-background text-foreground transition-all duration-200 shadow-sm relative z-40"
      )}
      style={{ width: collapsed ? 64 : width }}
    >
      {/* Drag Handle */}
      {!collapsed && (
        <div 
           className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-50 transform translate-x-1/2"
           onMouseDown={(e) => {
              e.preventDefault()
              isResizing.current = true
              document.body.style.cursor = 'col-resize'
           }}
        />
      )}
      <div className="flex items-center gap-3 px-4 py-4 mb-2 overflow-hidden bg-background/50 backdrop-blur-sm">
        <ProjectHubLogo size={32} className="hover:scale-105 transition-transform cursor-pointer" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
             <span className="text-sm font-bold tracking-tight text-foreground/90 truncate">ProjectHub</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Standard</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 custom-scrollbar">
        <div className="py-2 px-3 space-y-6">
          <div className="space-y-0.5">
            <SidebarNavItem collapsed={collapsed} to="/" icon={LayoutDashboard} label="For you" />
            <SidebarNavItem collapsed={collapsed} to="/recent" icon={Clock} label="Recent" hasChevron />
            <SidebarNavItem collapsed={collapsed} to="/starred" icon={Star} label="Starred" hasChevron />
            <SidebarNavItem collapsed={collapsed} to="/apps" icon={LayoutGrid} label="Apps" hasChevron />
            <SidebarNavItem collapsed={collapsed} to="/plans" icon={Sparkles} label="Plans" hasChevron hasBadge />
          </div>

          <div>
            {!collapsed && (
              <div className="mb-2 px-3 flex items-center justify-between group/spaces">
                 <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Spaces</span>
                 <div className="flex items-center gap-1 opacity-0 group-hover/spaces:opacity-100 transition-opacity">
                    <button className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-secondary" onClick={onCreateClick}><Plus className="h-3 w-3" /></button>
                    <button className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-secondary"><MoreHorizontal className="h-3 w-3" /></button>
                 </div>
              </div>
            )}
            
            <div className="space-y-0.5">
               {!collapsed && <div className="px-3 py-1.5 text-[9px] font-bold text-muted-foreground uppercase opacity-50 tracking-tighter">Recent</div>}
               
               <SidebarNavItem 
                collapsed={collapsed} 
                to="/summary" 
                label="Support"
                className="group/support"
                icon={() => (
                  <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#00b8d9] text-[10px] font-bold text-white uppercase shadow-sm group-hover/support:scale-110 transition-transform">
                     <Hash className="h-3 w-3" />
                  </div>
                )}
                isActiveProp={isSupportActive}
                hasChevron
                isExpanded={expanded["support"] !== false}
                onToggleExpand={(e) => {
                  e.preventDefault()
                  toggleExpand("support")
                }}
              />
              
              {!collapsed && expanded["support"] !== false && (
                 <div className="ml-9 space-y-0.5 border-l border-border/40 pl-2">
                    <SidebarNavItem collapsed={collapsed} to="/summary" label="Summary" isSubItem />
                    <SidebarNavItem 
                       collapsed={collapsed} 
                       to="/queues" 
                       label="Queues" 
                       isSubItem 
                       hasChevron 
                       isActiveProp={isQueuesActive}
                       isExpanded={expanded["queues"] !== false}
                       onToggleExpand={(e) => {
                          e.preventDefault()
                          toggleExpand("queues")
                       }}
                    />
                    {expanded["queues"] !== false && (
                       <div className="ml-2 space-y-0.5 border-l border-border/40 pl-2 mt-0.5">
                           <SidebarNavItem collapsed={collapsed} to="/queues/all" label="All open" isSubItem hasCounter counter={0} />
                           <SidebarNavItem collapsed={collapsed} to="/queues/assigned" label="Assigned to me" isSubItem hasCounter counter={0} />
                           <SidebarNavItem collapsed={collapsed} to="/queues/open" label="Open tasks" isSubItem hasCounter counter={0} />
                       </div>
                    )}
                 </div>
              )}

              {/* Show all projects as spaces */}
              {projects.map((p) => (
                <SidebarNavItem
                  key={p.id}
                  collapsed={collapsed}
                  to="/board"
                  label={p.name}
                  isActiveProp={selectedProject?.id === p.id}
                  onClick={() => selectProject(p.id)}
                  icon={() => (
                    <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-orange-500 text-[10px] font-bold text-white uppercase shadow-sm">
                      {p.key?.charAt(0) ?? "P"}
                    </div>
                  )}
                  hasChevron
                />
              ))}
              <SidebarNavItem collapsed={collapsed} to="/spaces" icon={MoreHorizontal} label="More spaces" />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 space-y-0.5">
            <SidebarNavItem collapsed={collapsed} to="/filters" icon={Filter} label="Filters" />
            <SidebarNavItem collapsed={collapsed} to="/dashboards" icon={LayoutPanelLeft} label="Dashboards" />
            <SidebarNavItem collapsed={collapsed} to="/operations" icon={Target} label="Operations" />
          </div>

          <div className="space-y-0.5 pt-4 border-t border-border/40 bg-secondary/10 mx-[-12px] px-3 py-4">
            <SidebarNavItem collapsed={collapsed} to="/confluence" icon={() => <div className="h-5 w-5 bg-blue-600 rounded-[2px] flex items-center justify-center text-[10px] text-white font-bold">C</div>} label="Confluence" hasExternal />
            <SidebarNavItem collapsed={collapsed} to="/teams" icon={Users} label="Teams" />
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/40 bg-background/50">
         <SidebarNavItem collapsed={collapsed} to="/customize" icon={Settings} label="Customize sidebar" />
      </div>

      <button
        onClick={onToggle}
        className={cn(
           "absolute -right-3 top-24 h-6 w-6 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground shadow-xl flex items-center justify-center transition-all z-50 hover:scale-110 active:scale-95",
           collapsed && "right-auto left-[50px] rotate-180"
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
    </aside>
  )
}

function SidebarNavItem({
  collapsed,
  to,
  icon: Icon,
  label,
  hasChevron,
  hasExternal,
  hasBadge,
  isSubItem,
  hasCounter,
  counter,
  className,
  isActiveProp,
  isExpanded,
  onToggleExpand,
  onClick
}: {
  collapsed: boolean
  to: string
  icon?: any
  label: string
  hasChevron?: boolean
  hasExternal?: boolean
  hasBadge?: boolean
  isSubItem?: boolean
  hasCounter?: boolean
  counter?: number
  className?: string
  isActiveProp?: boolean
  isExpanded?: boolean
  onToggleExpand?: (e: React.MouseEvent) => void
  onClick?: () => void
}) {
  const location = useLocation()
  const hasExplicitActive = isActiveProp !== undefined
  const isActive = hasExplicitActive ? isActiveProp : location.pathname === to

  const link = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: innerActive }) =>
        cn(
          "flex items-center gap-3 rounded-[3px] px-3 py-2 text-sm transition-all relative group overflow-hidden min-h-[40px]",
          collapsed && "justify-center px-0",
          (hasExplicitActive ? isActive : (isActive || innerActive))
            ? "bg-primary/10 text-primary font-bold shadow-[inset_3px_0_0_0_currentColor]" 
            : "text-muted-foreground/90 hover:bg-secondary/60 hover:text-foreground",
          isSubItem && "min-h-[32px] py-1.5",
          className
        )
      }
    >
      {Icon && (
        <div className="flex shrink-0 items-center justify-center">
          {typeof Icon === 'function' ? <Icon /> : <Icon className="h-4 w-4 transition-colors group-hover:text-foreground" />}
        </div>
      )}
      
      {!collapsed && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className={cn("truncate", isSubItem ? "text-[13px] font-medium" : "text-[14px] font-semibold")}>{label}</span>
          <div className="flex items-center gap-1.5 min-w-4 justify-end">
            {hasCounter && <span className="text-[10px] font-bold bg-secondary/80 px-1.5 rounded-full border border-border/10">{counter}</span>}
            {hasBadge && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />}
            {hasChevron && (
              <div 
                className="p-1 hover:bg-secondary rounded-sm transition-colors"
                onClick={onToggleExpand}
              >
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} />
              </div>
            )}
            {hasExternal && <ExternalLink className="h-3 w-3 opacity-30" />}
          </div>
        </div>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="border-border bg-popover text-popover-foreground shadow-2xl font-bold">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}
