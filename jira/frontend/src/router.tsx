import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageSkeleton } from "@/components/shared/PageSkeleton"
import { ProtectedRoute, PublicRoute } from "@/components/shared/ProtectedRoute"

const ForYouPage = lazy(() => import("@/features/home/ForYouPage"))
const RecentPage = lazy(() => import("@/features/home/RecentPage"))
const StarredPage = lazy(() => import("@/features/home/StarredPage"))
const AppsPage = lazy(() => import("@/features/home/AppsPage"))
const ProfilePage = lazy(() => import("@/features/home/ProfilePage"))
const SummaryPage = lazy(() => import("@/features/summary/SummaryPage"))
const BacklogPage = lazy(() => import("@/features/backlog/BacklogPage"))
const BoardPage = lazy(() => import("@/features/board/BoardPage"))
const CodePage = lazy(() => import("@/features/code/CodePage"))
const TimelinePage = lazy(() => import("@/features/timeline/TimelinePage"))
const PagesPage = lazy(() => import("@/features/pages/PagesPage"))
const FormsPage = lazy(() => import("@/features/forms/FormsPage"))
const ProjectsPage = lazy(() => import("@/features/projects/ProjectsPage"))
const SupportPage = lazy(() => import("@/features/support/SupportPage"))
const NotFoundPage = lazy(() => import("@/features/NotFoundPage"))
const PlaceholderPage = lazy(() => import("@/features/home/PlaceholderPage"))
const LoginPage = lazy(() => import("@/features/auth/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"))
const NotificationsPage = lazy(() => import("@/features/notifications/NotificationsPage"))
const EpicsPage = lazy(() => import("@/features/epics/EpicsPage"))

// Real feature pages (no more placeholders)
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"))
const ActivityFeedPage = lazy(() => import("@/features/activity/ActivityFeedPage"))
const TeamPage = lazy(() => import("@/features/team/TeamPage"))
const SpacesPage = lazy(() => import("@/features/spaces/SpacesPage"))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LazyPage><LoginPage /></LazyPage> },
          { path: "/register", element: <LazyPage><RegisterPage /></LazyPage> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Explicitly implemented Jira modules
          { path: "/", element: <LazyPage><ForYouPage /></LazyPage> },
          { path: "/summary", element: <LazyPage><SummaryPage /></LazyPage> },
          { path: "/backlog", element: <LazyPage><BacklogPage /></LazyPage> },
          { path: "/board", element: <LazyPage><BoardPage /></LazyPage> },
          { path: "/code", element: <LazyPage><CodePage /></LazyPage> },
          { path: "/timeline", element: <LazyPage><TimelinePage /></LazyPage> },
          { path: "/pages", element: <LazyPage><PagesPage /></LazyPage> },
          { path: "/forms", element: <LazyPage><FormsPage /></LazyPage> },
          { path: "/support", element: <LazyPage><SupportPage /></LazyPage> },

          // Placeholder Routes directly tied to new TopNav & Sidebar
          { path: "/recent", element: <LazyPage><RecentPage /></LazyPage> },
          { path: "/starred", element: <LazyPage><StarredPage /></LazyPage> },
          { path: "/apps", element: <LazyPage><AppsPage /></LazyPage> },
          { path: "/plans", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/queues", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/queues/all", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/queues/assigned", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/queues/open", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/spaces", element: <LazyPage><SpacesPage /></LazyPage> },
          { path: "/filters", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/dashboards", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/operations", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/confluence", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/teams", element: <LazyPage><PlaceholderPage /></LazyPage> },
          { path: "/customize", element: <LazyPage><PlaceholderPage /></LazyPage> },

          // Legacy Redirects
          { path: "/projects", element: <LazyPage><ProjectsPage /></LazyPage> },
          { path: "/projects/:projectId", element: <Navigate to="/summary" replace /> },
          { path: "/projects/:projectId/tasks/:taskId", element: <Navigate to="/board" replace /> },
          { path: "/sprints", element: <Navigate to="/backlog" replace /> },
          { path: "/team", element: <LazyPage><TeamPage /></LazyPage> },
          { path: "/teams", element: <LazyPage><TeamPage /></LazyPage> },
          { path: "/reports", element: <LazyPage><ReportsPage /></LazyPage> },
          { path: "/activity", element: <LazyPage><ActivityFeedPage /></LazyPage> },
          { path: "/settings", element: <Navigate to="/forms" replace /> },
          { path: "/notifications", element: <LazyPage><NotificationsPage /></LazyPage> },
          { path: "/epics", element: <LazyPage><EpicsPage /></LazyPage> },
          { path: "/profile", element: <LazyPage><ProfilePage /></LazyPage> },
        ],
      },
    ],
  },
  { path: "*", element: <LazyPage><NotFoundPage /></LazyPage> },
])
