import { NavLink } from "react-router-dom"
import {
  LayoutDashboard, FolderKanban, Columns3, ListTodo, MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MOBILE_NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/board", icon: Columns3, label: "Board" },
  { to: "/backlog", icon: ListTodo, label: "Backlog" },
  { to: "/settings", icon: MoreHorizontal, label: "More" },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around py-1">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
