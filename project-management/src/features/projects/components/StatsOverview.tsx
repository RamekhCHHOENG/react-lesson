import type { ProjectStats } from "@/types/project"
import {
  FolderKanban,
  ClipboardList,
  Loader2,
  PauseCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface StatsOverviewProps {
  stats: ProjectStats
}

const statItems = [
  { key: "total" as const, label: "Total", icon: FolderKanban, color: "#0052CC", bg: "#DEEBFF" },
  { key: "planning" as const, label: "Planning", icon: ClipboardList, color: "#4C9AFF", bg: "#DEEBFF" },
  { key: "inProgress" as const, label: "In Progress", icon: Loader2, color: "#FFAB00", bg: "#FFF7D6" },
  { key: "onHold" as const, label: "On Hold", icon: PauseCircle, color: "#FF8B00", bg: "#FFEBE6" },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, color: "#36B37E", bg: "#E3FCEF" },
  { key: "cancelled" as const, label: "Cancelled", icon: XCircle, color: "#DE350B", bg: "#FFEBE6" },
]

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statItems.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-white rounded border border-[#DFE1E6] p-3 hover:border-[#B3BAC5] transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded"
              style={{ backgroundColor: bg }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172B4D]">{stats[key]}</p>
          <p className="text-[11px] text-[#6B778C] font-medium mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
