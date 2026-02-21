import { Search, Bell, HelpCircle, Settings, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const pageLabel = PAGE_LABELS[activePage] ?? "Projects"

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-card border-b shrink-0 z-10">
      {/* Left section - breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">ProjectHub</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{pageLabel}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className={`transition-all ${searchFocused ? "w-[280px]" : "w-[200px]"}`}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Search"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Create button */}
        <Button size="sm" className="ml-2" onClick={onCreateProject}>
          <Plus className="h-3.5 w-3.5" />
          Create
        </Button>

        {/* Icons */}
        <Button variant="ghost" size="icon" className="ml-1">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-[18px] w-[18px]" />
        </Button>

        {/* User avatar */}
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-1 cursor-pointer hover:opacity-90 transition-opacity">
          U
        </div>
      </div>
    </header>
  )
}
