import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Search, Bell, CircleHelp, Settings, Sun, Moon, Plus } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { SearchDialog, useSearchShortcut } from "@/components/shared/SearchDialog"
import { KeyboardShortcutsDialog } from "@/components/shared/KeyboardShortcutsDialog"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ProjectProvider, useProjectContext } from "@/store/project-context"
import { useUnreadCount } from "@/hooks/useNotifications"
import { useAuth } from "@/store/auth"
import { useTheme } from "@/components/theme-provider"
import { getInitials } from "@/lib/utils"
import TaskFormDrawer from "@/features/projects/components/TaskFormDrawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { useNavigate } from "react-router-dom"

function DashboardLayoutInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchShortcut()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const { selectedProject, projects } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0
  const navigate = useNavigate()

  useKeyboardShortcuts(
    () => setSearchOpen(true),
    () => setShortcutsOpen(true),
  )

  useWebSocket()
  
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString())
  }, [sidebarCollapsed])
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden md:flex h-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCreateClick={() => setCreateTaskOpen(true)}
        />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[260px] border-r border-border bg-background p-0">
          <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} onCreateClick={() => setCreateTaskOpen(true)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Slim top bar — search + actions only */}
        <header className="border-b border-border/60 bg-background/95 backdrop-blur-md px-4 flex items-center h-[48px] justify-between sticky top-0 z-[100]">
          <div className="relative group w-full max-w-[480px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              onClick={() => setSearchOpen(true)}
              readOnly
              className="h-[32px] w-full rounded-[5px] border border-border/60 bg-secondary/30 pl-10 pr-4 text-sm text-foreground cursor-pointer hover:bg-secondary/50 transition-all font-medium placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button
              className="h-[32px] rounded-[3px] bg-[#0c66e4] hover:bg-[#0055cc] px-4 text-[13px] font-bold text-white shadow-sm active:scale-95 transition-all"
              onClick={() => setCreateTaskOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create
            </Button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            <button
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary relative transition-colors text-muted-foreground"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-destructive border-[1.5px] border-background" />}
            </button>

            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground">
              <CircleHelp className="h-[18px] w-[18px]" />
            </button>

            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground">
              <Settings className="h-[18px] w-[18px]" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="ml-1 group bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                  <Avatar className="h-[28px] w-[28px] ring-2 ring-background transition-all group-hover:ring-primary/40 shadow-sm cursor-pointer">
                    {user ? (
                      <>
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                        <AvatarFallback className="bg-orange-600 text-[10px] font-bold text-white uppercase">{getInitials(user.full_name)}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-secondary text-[10px] font-bold text-muted-foreground">?</AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[260px] p-0 rounded-[4px] border border-border shadow-2xl mt-1">
                {user && (
                  <>
                    <div className="p-4 bg-secondary/10 flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-[3px]">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                        <AvatarFallback className="bg-orange-600 text-sm font-bold text-white rounded-[3px]">{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="py-1">
                      <DropdownMenuItem className="px-4 py-2 text-sm font-medium cursor-pointer" onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                      <DropdownMenuItem className="px-4 py-2 text-sm font-medium cursor-pointer">Account settings</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="py-1">
                      <DropdownMenuItem className="px-4 py-2 text-sm font-bold text-destructive cursor-pointer" onClick={() => logout()}>Log out</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background/50">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <TaskFormDrawer
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={project?.id}
      />
    </div>
  )
}

export function DashboardLayout() {
  return (
    <ProjectProvider>
      <DashboardLayoutInner />
    </ProjectProvider>
  )
}
