import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  projects: "Projects",
  board: "Board",
  backlog: "Backlog",
  sprints: "Sprints",
  epics: "Epics",
  team: "Team",
  reports: "Reports",
  settings: "Settings",
  notifications: "Notifications",
  activity: "Activity",
}

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const crumbs: { label: string; path: string }[] = []
  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    currentPath += `/${seg}`

    const label = ROUTE_LABELS[seg]
    if (label) {
      crumbs.push({ label, path: currentPath })
    } else if (segments[i - 1] === "projects" && !ROUTE_LABELS[seg]) {
      // projectId — show as ID (could be improved with project name)
      crumbs.push({ label: seg.slice(0, 8) + "...", path: currentPath })
    } else if (segments[i - 1] === "tasks" && !ROUTE_LABELS[seg]) {
      crumbs.push({ label: `Task`, path: currentPath })
    }
  }

  if (crumbs.length === 0) return null

  return (
    <nav className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
