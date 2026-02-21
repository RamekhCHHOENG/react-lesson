import { useState, useCallback } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProjectProvider } from "@/store/ProjectContext"
import { Sidebar, TopNav } from "@/components/layout"
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

function AppShell() {
  const [activePage, setActivePage] = useState<Page>("projects")
  const [createTrigger, setCreateTrigger] = useState(0)

  const handleCreate = useCallback(() => {
    setCreateTrigger((p) => p + 1)
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
        return <ProjectManagementPage createTrigger={createTrigger} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeItem={activePage} onItemClick={(item) => setActivePage(item as Page)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav activePage={activePage} onCreateProject={handleCreate} />
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <AppShell />
      </ProjectProvider>
    </QueryClientProvider>
  )
}
