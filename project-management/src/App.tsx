import { useState, useCallback } from "react"
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

function Dashboard() {
  const [activePage, setActivePage] = useState<Page>("projects")
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const { createProject, isCreating } = useProjects()

  const handleCreate = useCallback(() => {
    setCreateProjectOpen(true)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page as Page)
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
      <Sidebar activeItem={activePage} onItemClick={(item) => setActivePage(item as Page)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav activePage={activePage} onCreateProject={handleCreate} onNavigate={handleNavigate} />
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
  const { isAuthenticated } = useAuth()

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
      </AuthProvider>
    </QueryClientProvider>
  )
}
