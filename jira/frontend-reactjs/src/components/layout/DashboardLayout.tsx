import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { SearchDialog, useSearchShortcut } from "@/components/shared/SearchDialog"
import { KeyboardShortcutsDialog } from "@/components/shared/KeyboardShortcutsDialog"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ProjectProvider, useProjectContext } from "@/store/project-context"
import TaskFormDrawer from "@/features/projects/components/TaskFormDrawer"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"

function DashboardLayoutInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchShortcut()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const { selectedProject, projects } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null

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
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[260px] border-r border-border bg-background p-0">
          <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav
          onSearchClick={() => setSearchOpen(true)}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onCreateClick={() => setCreateTaskOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-background/50">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {project && (
        <TaskFormDrawer
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
          projectId={project.id}
        />
      )}
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
