import { Search, Bell, HelpCircle, Settings, Plus } from "lucide-react"
import { useState } from "react"

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
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-[#DFE1E6] shrink-0 z-10">
      {/* Left section - breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#6B778C] hover:text-[#172B4D] cursor-pointer transition-colors">ProjectHub</span>
        <span className="text-[#6B778C]">/</span>
        <span className="font-medium text-[#172B4D]">{pageLabel}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div
          className={`flex items-center gap-2 rounded px-2.5 h-8 transition-all border ${
            searchFocused
              ? "border-[#4C9AFF] bg-white w-[280px]"
              : "border-transparent bg-[#F4F5F7] hover:bg-[#EBECF0] w-[200px]"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-[#6B778C] shrink-0" />
          <input
            className="bg-transparent border-0 outline-none text-sm text-[#172B4D] placeholder:text-[#6B778C] w-full"
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Create button */}
        <button
          onClick={onCreateProject}
          className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium transition-colors ml-2"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </button>

        {/* Icons */}
        <button className="flex items-center justify-center h-8 w-8 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors ml-1">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button className="flex items-center justify-center h-8 w-8 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>
        <button className="flex items-center justify-center h-8 w-8 rounded hover:bg-[#EBECF0] text-[#42526E] transition-colors">
          <Settings className="h-[18px] w-[18px]" />
        </button>

        {/* User avatar */}
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#00875A] text-white text-xs font-bold ml-1 cursor-pointer hover:opacity-90 transition-opacity">
          U
        </div>
      </div>
    </header>
  )
}
