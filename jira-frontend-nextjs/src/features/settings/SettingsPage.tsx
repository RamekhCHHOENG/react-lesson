import { useState, useEffect } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { useProjects } from "@/hooks/useProjects"
import { SettingsPageSkeleton } from "@/components/skeletons/PageSkeletons"
import { api } from "@/services/api"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Trash2,
  AlertTriangle,
  Database,
  Palette,
  Info,
  RefreshCw,
  Download,
} from "lucide-react"

export default function SettingsPage() {
  const { state, dispatch } = useProjectContext()
  const { isLoading } = useProjects()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [storageInfo, setStorageInfo] = useState({ size: "0 B", projectCount: 0, taskCount: 0 })
  const [isClearing, setIsClearing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const refreshData = async () => {
    const res = await api.projects.getAll()
    dispatch({ type: "SET_PROJECTS", payload: res.data })
    queryClient.invalidateQueries({ queryKey: ["projects"] })
  }

  useEffect(() => {
    api.storage.getInfo().then((res) => setStorageInfo(res.data))
  }, [state.projects])

  const handleClearAllData = async () => {
    setIsClearing(true)
    await api.storage.clearAll()
    await refreshData()
    setShowDeleteConfirm(false)
    setIsClearing(false)
  }

  const handleReseed = async () => {
    setIsSeeding(true)
    await api.storage.reseed()
    await refreshData()
    setIsSeeding(false)
  }

  const handleExportData = async () => {
    const res = await api.storage.exportJSON()
    const blob = new Blob([res.data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `projecthub-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading && state.projects.length === 0) {
    return <SettingsPageSkeleton />
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
            <SettingRow label="API Layer" value="FastAPI + PostgreSQL + Redis" />
            <SettingRow label="Total Projects" value={String(storageInfo.projectCount)} />
            <SettingRow label="Total Issues" value={String(storageInfo.taskCount)} />
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Database className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm">Data & Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <SettingRow label="Storage Type" value="PostgreSQL" />
            <SettingRow label="Data Size" value={storageInfo.size} />
            <div className="pt-2 space-y-3">
              <p className="text-xs text-muted-foreground">
                Data is stored in the real backend and persists across refreshes and container restarts.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-3.5 w-3.5" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReseed}
                  disabled={isSeeding}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                  {isSeeding ? "Seeding…" : "Re-seed demo data"}
                </Button>
              </div>
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
            <SettingRow label="Theme" value="Jira-inspired Design System" />
            <SettingRow label="Color Scheme" value="Light" />
            <SettingRow label="UI Library" value="shadcn/ui + Radix UI" />
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded bg-[#0052CC]" title="Primary (#0052CC)" />
              <div className="w-6 h-6 rounded bg-[#172B4D]" title="Foreground (#172B4D)" />
              <div className="w-6 h-6 rounded bg-[#36B37E]" title="Success" />
              <div className="w-6 h-6 rounded bg-[#DE350B]" title="Danger" />
              <div className="w-6 h-6 rounded bg-[#FFAB00]" title="Warning" />
              <div className="w-6 h-6 rounded bg-[#6554C0]" title="Purple" />
              <span className="text-xs text-muted-foreground ml-2">Brand palette</span>
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
                    disabled={isClearing}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isClearing ? "Deleting…" : "Confirm Delete"}
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
