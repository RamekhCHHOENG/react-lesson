import { useState, useMemo } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Trash2,
  AlertTriangle,
  Database,
  Palette,
  Info,
} from "lucide-react"

export default function SettingsPage() {
  const { state, dispatch } = useProjectContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const storageSize = useMemo(() => {
    const raw = localStorage.getItem("projecthub_projects") ?? ""
    const bytes = new Blob([raw]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [state.projects])

  const handleClearAllData = () => {
    localStorage.removeItem("projecthub_projects")
    dispatch({ type: "LOAD_PROJECTS" })
    setShowDeleteConfirm(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-muted-foreground to-secondary">
              <Settings className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Project Settings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your workspace preferences and data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
        {/* General Info */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">General Information</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <SettingRow label="Application" value="ProjectHub" />
            <SettingRow label="Version" value="1.0.0" />
            <SettingRow label="Total Projects" value={String(state.projects.length)} />
            <SettingRow
              label="Total Issues"
              value={String(state.projects.reduce((sum, p) => sum + p.tasks.length, 0))}
            />
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Database className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm">Data & Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <SettingRow label="Storage Type" value="Local Storage (Browser)" />
            <SettingRow label="Data Size" value={storageSize} />
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">
                All data is stored locally in your browser. Clearing your browser data will
                remove all projects and issues.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Palette className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <SettingRow label="Theme" value="shadcn/ui Design System" />
            <SettingRow label="Color Scheme" value="Light" />
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded bg-primary" title="Primary" />
              <div className="w-6 h-6 rounded bg-foreground" title="Text" />
              <div className="w-6 h-6 rounded bg-green-600" title="Success" />
              <div className="w-6 h-6 rounded bg-destructive" title="Danger" />
              <div className="w-6 h-6 rounded bg-orange-500" title="Warning" />
              <div className="w-6 h-6 rounded bg-purple-600" title="Purple" />
              <span className="text-xs text-muted-foreground ml-2">Brand Colors</span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="overflow-hidden border-destructive/30">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b border-destructive/30 bg-destructive/5 py-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete all data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will permanently remove all projects, issues, and settings.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete All
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAllData}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Confirm Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
