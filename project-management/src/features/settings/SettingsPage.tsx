import { useState, useMemo } from "react"
import { useProjectContext } from "@/store/ProjectContext"
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
    <div className="h-full flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#6B778C] to-[#42526E]">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#172B4D]">Project Settings</h1>
              <p className="text-sm text-[#6B778C] mt-0.5">
                Manage your workspace preferences and data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
        {/* General Info */}
        <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center gap-2">
            <Info className="h-4 w-4 text-[#0052CC]" />
            <h3 className="text-sm font-semibold text-[#172B4D]">General Information</h3>
          </div>
          <div className="p-5 space-y-4">
            <SettingRow label="Application" value="ProjectHub" />
            <SettingRow label="Version" value="1.0.0" />
            <SettingRow label="Total Projects" value={String(state.projects.length)} />
            <SettingRow
              label="Total Issues"
              value={String(state.projects.reduce((sum, p) => sum + p.tasks.length, 0))}
            />
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center gap-2">
            <Database className="h-4 w-4 text-[#6554C0]" />
            <h3 className="text-sm font-semibold text-[#172B4D]">Data & Storage</h3>
          </div>
          <div className="p-5 space-y-4">
            <SettingRow label="Storage Type" value="Local Storage (Browser)" />
            <SettingRow label="Data Size" value={storageSize} />
            <div className="pt-2">
              <p className="text-xs text-[#6B778C] mb-3">
                All data is stored locally in your browser. Clearing your browser data will
                remove all projects and issues.
              </p>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#00875A]" />
            <h3 className="text-sm font-semibold text-[#172B4D]">Appearance</h3>
          </div>
          <div className="p-5 space-y-4">
            <SettingRow label="Theme" value="Atlassian Design System" />
            <SettingRow label="Color Scheme" value="Light" />
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded bg-[#0052CC]" title="Primary" />
              <div className="w-6 h-6 rounded bg-[#172B4D]" title="Text" />
              <div className="w-6 h-6 rounded bg-[#00875A]" title="Success" />
              <div className="w-6 h-6 rounded bg-[#FF5630]" title="Danger" />
              <div className="w-6 h-6 rounded bg-[#FF8B00]" title="Warning" />
              <div className="w-6 h-6 rounded bg-[#6554C0]" title="Purple" />
              <span className="text-xs text-[#6B778C] ml-2">Brand Colors</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded border border-[#FFEBE6] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#FFEBE6] bg-[#FFEBE6]/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#DE350B]" />
            <h3 className="text-sm font-semibold text-[#DE350B]">Danger Zone</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#172B4D]">Delete all data</p>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  This will permanently remove all projects, issues, and settings.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded border border-[#DE350B] text-[#DE350B] text-sm font-medium hover:bg-[#FFEBE6] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete All
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-8 px-3 rounded border border-[#DFE1E6] text-sm font-medium text-[#42526E] hover:bg-[#F4F5F7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAllData}
                    className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#DE350B] text-white text-sm font-medium hover:bg-[#BF2600] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F4F5F7] last:border-0">
      <span className="text-sm text-[#42526E]">{label}</span>
      <span className="text-sm font-medium text-[#172B4D]">{value}</span>
    </div>
  )
}
