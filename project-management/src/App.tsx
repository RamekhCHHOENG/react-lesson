import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProjectProvider } from "@/store/ProjectContext"
import { ProjectManagementPage } from "@/features/projects"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <ProjectManagementPage />
      </ProjectProvider>
    </QueryClientProvider>
  )
}
