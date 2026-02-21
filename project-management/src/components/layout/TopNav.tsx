import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  LogOut,
  X,
  FolderKanban,
  CheckSquare,
  ExternalLink,
  Keyboard,
  Info,
} from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/store/AuthContext"
import { useProjectContext } from "@/store/ProjectContext"
import { api, type SearchResult } from "@/services/api"
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
  onNavigate?: (page: string) => void
}

export function TopNav({ onCreateProject, activePage = "projects", onNavigate }: TopNavProps) {
  const { user, logout } = useAuth()
  const { state } = useProjectContext()
  const pageLabel = PAGE_LABELS[activePage] ?? "Projects"
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  // ── Search ──────────────────────────
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await api.search(q)
      setSearchResults(res.data)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSearchOpen(true)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => doSearch(value), 250)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchOpen(false)
  }

  // ── Notifications ───────────────────
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Build real notifications from data
  const notifications = (() => {
    const items: { id: string; text: string; time: string; icon: "project" | "task" }[] = []
    const allProjects = state.projects.slice(0, 3)
    for (const p of allProjects) {
      const recentTasks = p.tasks
        .filter((t) => t.updatedAt)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 1)
      for (const t of recentTasks) {
        items.push({
          id: t.id,
          text: `"${t.title}" updated in ${p.name}`,
          time: timeAgo(t.updatedAt),
          icon: "task",
        })
      }
    }
    if (items.length === 0) {
      items.push({ id: "empty", text: "No recent activity", time: "", icon: "task" })
    }
    return items
  })()

  // ── Help ────────────────────────────
  const [helpOpen, setHelpOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)

  // ── User menu ───────────────────────
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-[#DFE1E6] shrink-0 z-20">
      {/* Left – breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span
          className="text-[#6B778C] hover:text-[#0052CC] cursor-pointer transition-colors"
          onClick={() => onNavigate?.("projects")}
        >
          ProjectHub
        </span>
        <span className="text-[#C1C7D0]">/</span>
        <span className="font-medium text-[#172B4D]">{pageLabel}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* ── Search ── */}
        <div ref={searchRef} className="relative">
          <div
            className={`flex items-center gap-2 rounded-[3px] px-2.5 h-8 transition-all border ${
              searchOpen || searchQuery
                ? "border-[#4C9AFF] bg-white w-[280px] shadow-sm"
                : "border-transparent bg-[#F4F5F7] hover:bg-[#EBECF0] w-[200px]"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-[#6B778C] shrink-0" />
            <input
              className="bg-transparent border-0 outline-none text-sm text-[#172B4D] placeholder:text-[#7A869A] w-full"
              placeholder="Search projects & tasks…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery) setSearchOpen(true)
              }}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="shrink-0 hover:text-[#172B4D] text-[#6B778C]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchOpen && searchQuery && (
            <div className="absolute right-0 top-full mt-1 w-[360px] bg-white rounded-md border border-[#DFE1E6] shadow-lg z-50 max-h-[360px] overflow-auto">
              {searchLoading ? (
                <div className="px-4 py-6 text-center text-sm text-[#6B778C]">Searching…</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[#6B778C]">
                  No results for "{searchQuery}"
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-[#6B778C] uppercase tracking-wider border-b">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </div>
                  {searchResults.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      className="flex items-start gap-3 w-full px-3 py-2.5 hover:bg-[#F4F5F7] text-left transition-colors border-b last:border-0"
                      onClick={() => {
                        clearSearch()
                        if (r.type === "project") onNavigate?.("projects")
                        else onNavigate?.("backlog")
                      }}
                    >
                      <div className="shrink-0 mt-0.5">
                        {r.type === "project" ? (
                          <FolderKanban className="h-4 w-4 text-[#0052CC]" />
                        ) : (
                          <CheckSquare className="h-4 w-4 text-[#6554C0]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#172B4D] truncate">{r.title}</p>
                        <p className="text-[11px] text-[#6B778C] truncate mt-0.5">
                          {r.type === "task" ? r.projectName : r.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-[#6B778C] uppercase shrink-0 mt-0.5">
                        {r.type}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Create button */}
        <Button
          size="sm"
          onClick={onCreateProject}
          className="ml-2 h-8 rounded-[3px] bg-[#0052CC] hover:bg-[#0065FF] text-white font-medium shadow-none"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </Button>

        {/* ── Notification bell ── */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ml-1 rounded-[3px] text-[#42526E] hover:bg-[#EBECF0] ${notifOpen ? "bg-[#EBECF0]" : ""}`}
            onClick={() => {
              setNotifOpen(!notifOpen)
              setHelpOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {notifications.length > 0 && notifications[0].id !== "empty" && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF5630]" />
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-[320px] bg-white rounded-md border border-[#DFE1E6] shadow-lg z-50">
              <div className="px-4 py-2.5 border-b flex items-center justify-between">
                <span className="text-sm font-semibold text-[#172B4D]">Notifications</span>
                <span className="text-[10px] text-[#6B778C]">{notifications.length}</span>
              </div>
              <div className="max-h-[280px] overflow-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-[#F4F5F7] transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.icon === "task" ? (
                        <CheckSquare className="h-4 w-4 text-[#0052CC]" />
                      ) : (
                        <FolderKanban className="h-4 w-4 text-[#6554C0]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#172B4D]">{n.text}</p>
                      {n.time && <p className="text-[11px] text-[#6B778C] mt-0.5">{n.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Help ── */}
        <div ref={helpRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-[3px] text-[#42526E] hover:bg-[#EBECF0] ${helpOpen ? "bg-[#EBECF0]" : ""}`}
            onClick={() => {
              setHelpOpen(!helpOpen)
              setNotifOpen(false)
              setUserMenuOpen(false)
            }}
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>

          {helpOpen && (
            <div className="absolute right-0 top-full mt-1 w-[260px] bg-white rounded-md border border-[#DFE1E6] shadow-lg z-50">
              <div className="px-4 py-2.5 border-b">
                <span className="text-sm font-semibold text-[#172B4D]">Help & Resources</span>
              </div>
              <div className="py-1">
                {[
                  { icon: Info, label: "About ProjectHub", desc: "Version 1.0.0" },
                  { icon: Keyboard, label: "Keyboard shortcuts", desc: "Coming soon" },
                  { icon: ExternalLink, label: "Documentation", desc: "View docs" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F4F5F7] transition-colors text-left"
                    onClick={() => setHelpOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-[#6B778C] shrink-0" />
                    <div>
                      <p className="text-sm text-[#172B4D]">{item.label}</p>
                      <p className="text-[11px] text-[#6B778C]">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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

        {/* ── User avatar with dropdown ── */}
        <div ref={userMenuRef} className="relative">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full bg-[#00875A] text-white text-xs font-bold ml-1 cursor-pointer hover:opacity-90 transition-opacity"
            title={user?.email ?? ""}
            onClick={() => {
              setUserMenuOpen(!userMenuOpen)
              setNotifOpen(false)
              setHelpOpen(false)
            }}
          >
            {initials}
          </div>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-[220px] bg-white rounded-md border border-[#DFE1E6] shadow-lg z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-[#172B4D]">{user?.name ?? "User"}</p>
                <p className="text-[11px] text-[#6B778C] mt-0.5">{user?.email ?? ""}</p>
              </div>
              <div className="py-1">
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F4F5F7] transition-colors text-left"
                  onClick={() => {
                    onNavigate?.("settings")
                    setUserMenuOpen(false)
                  }}
                >
                  <span className="text-sm text-[#172B4D]">Settings</span>
                </button>
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#FFEBE6] transition-colors text-left"
                  onClick={() => {
                    logout()
                    setUserMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 text-[#DE350B]" />
                  <span className="text-sm text-[#DE350B]">Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Helpers ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
