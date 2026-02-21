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
        "flex flex-col h-full bg-[#FAFBFC] border-r border-[#DFE1E6] transition-all duration-200 select-none",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {/* Project header */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-[#DFE1E6] shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#0065FF] to-[#6554C0] shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-[#172B4D] truncate">ProjectHub</div>
            <div className="text-[11px] text-[#6B778C] truncate">Software Project</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onItemClick?.(id)}
            className={cn(
              "flex items-center gap-3 w-full rounded px-2.5 py-2 text-sm font-medium transition-colors",
              activeItem === id
                ? "bg-[#E9F2FF] text-[#0052CC]"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="py-2 px-2 border-t border-[#DFE1E6] space-y-0.5">
        {bottomItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onItemClick?.(id)}
            className={cn(
              "flex items-center gap-3 w-full rounded px-2.5 py-2 text-sm font-medium transition-colors",
              activeItem === id
                ? "bg-[#E9F2FF] text-[#0052CC]"
                : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded px-2.5 py-2 text-sm font-medium text-[#6B778C] hover:bg-[#EBECF0] hover:text-[#172B4D] transition-colors"
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
