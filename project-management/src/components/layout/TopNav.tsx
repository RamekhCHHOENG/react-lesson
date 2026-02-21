import { Search, Bell, HelpCircle, Settings, Plus, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/store/AuthContext"
import { Button } from "@/components/ui/button"

const PAGE_LABELS: Record<string, string> = {
  projects: "Projects",
  board: "Board",
  backlog: "Backlog",
  reports: "Reports",
  settings: "Settings",
}

interface TopNavProps {
  onCreateProject?: () => void
  activePage?: string
}

export function TopNav({ onCreateProject, activePage = "projects" }: TopNavProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const { user, logout } = useAuth()
  const pageLabel = PAGE_LABELS[activePage] ?? "Projects"
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-card border-b shrink-0 z-10">
      {/* Left section - breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">ProjectHub</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{pageLabel}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div
          className={`flex items-center gap-2 rounded px-2.5 h-8 transition-all border ${
            searchFocused
              ? "border-ring bg-card w-[280px]"
              : "border-transparent bg-muted hover:bg-accent w-[200px]"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            className="bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Create button */}
        <Button size="sm" onClick={onCreateProject} className="ml-2">
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </Button>

        {/* Icons */}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-[18px] w-[18px]" />
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
          title="Sign out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </Button>

        {/* User avatar */}
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-1 cursor-pointer hover:opacity-90 transition-opacity" title={user?.email ?? ""}>
          {initials}
        </div>
      </div>
    </header>
  )
}
