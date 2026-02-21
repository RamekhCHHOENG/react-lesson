import { Search, Bell, HelpCircle, Plus, LogOut } from "lucide-react"
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
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-[#DFE1E6] shrink-0 z-10">
      {/* Left – breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-[#6B778C] hover:text-[#0052CC] cursor-pointer transition-colors">
          ProjectHub
        </span>
        <span className="text-[#C1C7D0]">/</span>
        <span className="font-medium text-[#172B4D]">{pageLabel}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div
          className={`flex items-center gap-2 rounded-[3px] px-2.5 h-8 transition-all border ${
            searchFocused
              ? "border-[#4C9AFF] bg-white w-[280px] shadow-sm"
              : "border-transparent bg-[#F4F5F7] hover:bg-[#EBECF0] w-[200px]"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-[#6B778C] shrink-0" />
          <input
            className="bg-transparent border-0 outline-none text-sm text-[#172B4D] placeholder:text-[#7A869A] w-full"
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Create button – Jira style */}
        <Button
          size="sm"
          onClick={onCreateProject}
          className="ml-2 h-8 rounded-[3px] bg-[#0052CC] hover:bg-[#0065FF] text-white font-medium shadow-none"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </Button>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 rounded-[3px] text-[#42526E] hover:bg-[#EBECF0]">
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[3px] text-[#42526E] hover:bg-[#EBECF0]">
          <HelpCircle className="h-[18px] w-[18px]" />
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-[3px] text-[#42526E] hover:bg-[#FFEBE6] hover:text-[#DE350B]"
          onClick={logout}
          title="Sign out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </Button>

        {/* User avatar */}
        <div
          className="flex items-center justify-center h-8 w-8 rounded-full bg-[#00875A] text-white text-xs font-bold ml-1 cursor-pointer hover:opacity-90 transition-opacity"
          title={user?.email ?? ""}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
