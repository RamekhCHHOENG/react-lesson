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
  { key: "total" as const, label: "Total", icon: FolderKanban, bg: "bg-indigo-50", text: "text-indigo-600" },
  { key: "planning" as const, label: "Planning", icon: ClipboardList, bg: "bg-blue-50", text: "text-blue-600" },
  { key: "inProgress" as const, label: "In Progress", icon: Loader2, bg: "bg-amber-50", text: "text-amber-600" },
  { key: "onHold" as const, label: "On Hold", icon: PauseCircle, bg: "bg-orange-50", text: "text-orange-600" },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  { key: "cancelled" as const, label: "Cancelled", icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
]

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {statItems.map(({ key, label, icon: Icon, bg, text }) => (
        <div key={key} className={`rounded-xl ${bg} p-4`}>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${text}`} />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${text}`}>{stats[key]}</p>
        </div>
      ))}
    </div>
  )
}
