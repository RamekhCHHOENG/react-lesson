import { useState } from "react"
import { useAuth } from "@/store/auth"
import { useProjects } from "@/hooks/useProjects"
import { useAllTasks } from "@/hooks/useTasks"
import { api } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  LogOut,
  Download,
  RefreshCw,
  Trash2,
  Sun,
  Moon,
  FolderKanban,
  ListTodo,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { LabelsManager } from "@/features/settings/components/LabelsManager"
import { ProfileForm } from "@/features/settings/components/ProfileForm"

// ── General Tab ───────────────────────────────────────────────────────────────

function GeneralTab() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileForm />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your account session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Workspace Tab ─────────────────────────────────────────────────────────────

function WorkspaceTab() {
  const { data: projects } = useProjects()
  const { data: allTasks } = useAllTasks()
  const [isExporting, setIsExporting] = useState(false)
  const [isReseeding, setIsReseeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const projectCount = projects?.length ?? 0
  const taskCount = allTasks?.length ?? 0

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await api.get<unknown>("/storage/export")
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `jira-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const handleReseed = async () => {
    setIsReseeding(true)
    try {
      await api.post("/storage/reseed")
      toast.success("Demo data has been re-seeded. Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Re-seed failed")
    } finally {
      setIsReseeding(false)
    }
  }

  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await api.delete("/storage/clear")
      toast.success("All data has been cleared. Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Clear failed")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Overview</CardTitle>
          <CardDescription>Current workspace statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-sm border p-4">
              <FolderKanban className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projectCount}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-sm border p-4">
              <ListTodo className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{taskCount}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
          <CardDescription>Export or manage your workspace data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-sm border p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">
                  Download all your workspace data as JSON
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-sm border p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Re-seed Demo Data</p>
                <p className="text-xs text-muted-foreground">
                  Reset workspace with sample projects and tasks
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Re-seed
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Re-seed Demo Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace your current data with fresh demo data. Any changes you have
                    made will be lost. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReseed} disabled={isReseeding}>
                    {isReseeding ? "Re-seeding..." : "Yes, Re-seed"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-sm border border-destructive/30 p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Delete All Data</p>
                <p className="text-xs text-muted-foreground">
                  Permanently remove all projects, tasks, and settings
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all projects, tasks, sprints, members, and all
                    associated data. This action is irreversible and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClearing ? "Deleting..." : "Yes, Delete Everything"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Appearance Tab ────────────────────────────────────────────────────────────

function AppearanceTab() {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  )

  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked)
    document.documentElement.classList.toggle("dark", checked)
    localStorage.setItem("theme", checked ? "dark" : "light")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Customize the appearance of the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-sm border p-4">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  {darkMode
                    ? "Switch to light mode for a brighter interface"
                    : "Switch to dark mode for a darker interface that is easier on the eyes"}
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">Jira Clone</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">React 19 + TypeScript</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">UI Library</span>
              <span className="font-medium">shadcn/ui</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="workspace">
          <WorkspaceTab />
        </TabsContent>

        <TabsContent value="labels">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labels</CardTitle>
              <CardDescription>Manage labels for tagging and organizing tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <LabelsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
