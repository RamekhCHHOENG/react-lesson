import { useState } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

const navItems = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "board", label: "Board", icon: LayoutDashboard },
  { id: "backlog", label: "Backlog", icon: CheckSquare },
  { id: "reports", label: "Reports", icon: BarChart3 },
]

const bottomItems = [
  { id: "settings", label: "Project Settings", icon: Settings },
]

export function Sidebar({ activeItem = "projects", onItemClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-200 select-none",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
      style={{ background: "linear-gradient(180deg, #0C2340 0%, #172B4D 100%)" }}
    >
      {/* Project header */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-[#0052CC] shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">ProjectHub</div>
            <div className="text-[11px] text-white/50 truncate">Software Project</div>
          </div>
        )}
      </div>

      {/* Planning section label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Planning
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 px-2 space-y-0.5 overflow-y-auto", collapsed ? "py-2" : "py-1")}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onItemClick?.(id)}
            className={cn(
              "flex items-center gap-3 w-full rounded px-2.5 py-[9px] text-[13px] font-medium transition-colors relative",
              activeItem === id
                ? "bg-white/12 text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white/90"
            )}
            title={collapsed ? label : undefined}
          >
            {activeItem === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4C9AFF] rounded-r" />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="py-2 px-2 border-t border-white/10 space-y-0.5">
        {bottomItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onItemClick?.(id)}
            className={cn(
              "flex items-center gap-3 w-full rounded px-2.5 py-[9px] text-[13px] font-medium transition-colors relative",
              activeItem === id
                ? "bg-white/12 text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white/90"
            )}
            title={collapsed ? label : undefined}
          >
            {activeItem === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4C9AFF] rounded-r" />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded px-2.5 py-[9px] text-[13px] font-medium text-white/40 hover:bg-white/8 hover:text-white/65 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
