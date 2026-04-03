import { useState, useCallback, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProjectProvider } from "@/store/ProjectContext"
import { AuthProvider, useAuth } from "@/store/AuthContext"
import { Sidebar, TopNav } from "@/components/layout"
import { ProjectFormDialog } from "@/features/projects/components"
import { useProjects } from "@/hooks/useProjects"
import LoginPage from "@/features/auth/LoginPage"
import ProjectManagementPage from "@/features/projects/ProjectManagementPage"
import BoardPage from "@/features/board/BoardPage"
import BacklogPage from "@/features/backlog/BacklogPage"
import ReportsPage from "@/features/reports/ReportsPage"
import SettingsPage from "@/features/settings/SettingsPage"
import { Toaster } from "sonner"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

type Page = "projects" | "board" | "backlog" | "reports" | "settings"

const VALID_PAGES: Page[] = ["projects", "board", "backlog", "reports", "settings"]

/** Read the current page from the URL hash, e.g. #board → "board" */
function getPageFromHash(): Page {
  const raw = window.location.hash.replace("#", "").toLowerCase()
  return VALID_PAGES.includes(raw as Page) ? (raw as Page) : "projects"
}

function Dashboard() {
  const [activePage, setActivePage] = useState<Page>(getPageFromHash)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const { createProject, isCreating } = useProjects()

  // Push to hash when navigating
  const navigate = useCallback((page: Page) => {
    setActivePage(page)
    window.location.hash = page === "projects" ? "" : page
  }, [])

  // Listen for browser back / forward
  useEffect(() => {
    const onHashChange = () => setActivePage(getPageFromHash())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  const handleCreate = useCallback(() => {
    setCreateProjectOpen(true)
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case "board":
        return <BoardPage />
      case "backlog":
        return <BacklogPage />
      case "reports":
        return <ReportsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <ProjectManagementPage />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
      <Sidebar activeItem={activePage} onItemClick={(item) => navigate(item as Page)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav activePage={activePage} onCreateProject={handleCreate} onNavigate={(p) => navigate(p as Page)} />
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
      </div>

      {/* Global "Create Project" dialog – opened by TopNav Create button on ANY page */}
      <ProjectFormDialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onSubmit={(data) => createProject(data)}
        title="Create project"
        isLoading={isCreating}
      />
    </div>
  )
}

function AppShell() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F5F7]">
        <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-3 text-sm text-[#42526E] shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DFE1E6] border-t-[#0052CC]" />
          Loading workspace...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <ProjectProvider>
      <Dashboard />
    </ProjectProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 3000 }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
