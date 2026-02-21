import { useMemo } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { TASK_STATUS_CONFIG, PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from "@/config"
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Users,
  Target,
} from "lucide-react"

export default function ReportsPage() {
  const { state } = useProjectContext()

  const stats = useMemo(() => {
    const projects = state.projects
    const allTasks = projects.flatMap((p) => p.tasks)

    const tasksByStatus = {
      todo: allTasks.filter((t) => t.status === "todo").length,
      "in-progress": allTasks.filter((t) => t.status === "in-progress").length,
      review: allTasks.filter((t) => t.status === "review").length,
      done: allTasks.filter((t) => t.status === "done").length,
    }

    const projectsByStatus = {
      planning: projects.filter((p) => p.status === "planning").length,
      "in-progress": projects.filter((p) => p.status === "in-progress").length,
      "on-hold": projects.filter((p) => p.status === "on-hold").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    }

    const projectsByPriority = {
      low: projects.filter((p) => p.priority === "low").length,
      medium: projects.filter((p) => p.priority === "medium").length,
      high: projects.filter((p) => p.priority === "high").length,
      urgent: projects.filter((p) => p.priority === "urgent").length,
    }

    const totalTasks = allTasks.length
    const completedTasks = tasksByStatus.done
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const assignees = new Set(allTasks.map((t) => t.assignee).filter(Boolean))

    // Overdue tasks (tasks with dueDate in the past and not done)
    const today = new Date().toISOString().split("T")[0]
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    ).length

    // Project with most tasks
    const projectTaskCounts = projects.map((p) => ({
      name: p.name,
      total: p.tasks.length,
      done: p.tasks.filter((t) => t.status === "done").length,
      progress: p.tasks.length > 0
        ? Math.round((p.tasks.filter((t) => t.status === "done").length / p.tasks.length) * 100)
        : 0,
    }))

    return {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      teamSize: assignees.size,
      tasksByStatus,
      projectsByStatus,
      projectsByPriority,
      projectTaskCounts,
    }
  }, [state.projects])

  const maxTaskCount = Math.max(
    stats.tasksByStatus.todo,
    stats.tasksByStatus["in-progress"],
    stats.tasksByStatus.review,
    stats.tasksByStatus.done,
    1
  )

  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#FF5630] to-[#FF8B00]">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#172B4D]">Reports</h1>
              <p className="text-sm text-[#6B778C] mt-0.5">
                Overview of your project metrics and team productivity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<FolderKanban className="h-5 w-5" />}
            iconBg="bg-[#DEEBFF]"
            iconColor="text-[#0052CC]"
            label="Total Projects"
            value={stats.totalProjects}
          />
          <SummaryCard
            icon={<Target className="h-5 w-5" />}
            iconBg="bg-[#E3FCEF]"
            iconColor="text-[#00875A]"
            label="Total Issues"
            value={stats.totalTasks}
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-[#E3FCEF]"
            iconColor="text-[#00875A]"
            label="Completion Rate"
            value={`${stats.completionRate}%`}
          />
          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-[#FFEBE6]"
            iconColor="text-[#DE350B]"
            label="Overdue Issues"
            value={stats.overdueTasks}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Distribution Chart */}
          <div className="bg-white rounded border border-[#DFE1E6] p-5">
            <h3 className="text-sm font-semibold text-[#172B4D] mb-4">
              Issue Distribution by Status
            </h3>
            <div className="space-y-3">
              {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => {
                const count = stats.tasksByStatus[key as keyof typeof stats.tasksByStatus] ?? 0
                const pct = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: config.dotColor.replace("bg-[", "").replace("]", "") }}
                    />
                    <span className="text-sm text-[#42526E] w-24">{config.label}</span>
                    <div className="flex-1 h-6 bg-[#F4F5F7] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width: `${(count / maxTaskCount) * 100}%`,
                          backgroundColor: config.dotColor.replace("bg-[", "").replace("]", ""),
                          minWidth: count > 0 ? "8px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#172B4D] w-8 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-[#6B778C] w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white rounded border border-[#DFE1E6] p-5">
            <h3 className="text-sm font-semibold text-[#172B4D] mb-4">
              Project Status Overview
            </h3>
            <div className="space-y-3">
              {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => {
                const count =
                  stats.projectsByStatus[key as keyof typeof stats.projectsByStatus] ?? 0
                const pct =
                  stats.totalProjects > 0 ? (count / stats.totalProjects) * 100 : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{
                        backgroundColor: config.dotColor.replace("bg-[", "").replace("]", ""),
                      }}
                    />
                    <span className="text-sm text-[#42526E] w-24">{config.label}</span>
                    <div className="flex-1 h-6 bg-[#F4F5F7] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width:
                            stats.totalProjects > 0
                              ? `${pct}%`
                              : "0%",
                          backgroundColor: config.dotColor
                            .replace("bg-[", "")
                            .replace("]", ""),
                          minWidth: count > 0 ? "8px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#172B4D] w-8 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-[#6B778C] w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded border border-[#DFE1E6] p-5">
            <h3 className="text-sm font-semibold text-[#172B4D] mb-4">
              Projects by Priority
            </h3>
            <div className="flex items-end gap-6 h-40 pt-4">
              {Object.entries(PROJECT_PRIORITY_CONFIG).map(([key, config]) => {
                const count =
                  stats.projectsByPriority[key as keyof typeof stats.projectsByPriority] ?? 0
                const maxPri = Math.max(...Object.values(stats.projectsByPriority), 1)
                const height = (count / maxPri) * 100
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-[#172B4D]">{count}</span>
                    <div className="w-full bg-[#F4F5F7] rounded-t relative" style={{ height: "100%" }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500"
                        style={{
                          height: `${height}%`,
                          backgroundColor: config.color
                            .replace("text-[", "")
                            .replace("]", ""),
                          minHeight: count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#6B778C] uppercase">
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team / Quick stats */}
          <div className="bg-white rounded border border-[#DFE1E6] p-5">
            <h3 className="text-sm font-semibold text-[#172B4D] mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <QuickStat
                icon={<Users className="h-4 w-4 text-[#0052CC]" />}
                label="Team Members"
                value={stats.teamSize || "—"}
              />
              <QuickStat
                icon={<CheckCircle2 className="h-4 w-4 text-[#00875A]" />}
                label="Issues Completed"
                value={`${stats.completedTasks} / ${stats.totalTasks}`}
              />
              <QuickStat
                icon={<Clock className="h-4 w-4 text-[#FF8B00]" />}
                label="In Progress"
                value={stats.tasksByStatus["in-progress"]}
              />
              <QuickStat
                icon={<AlertTriangle className="h-4 w-4 text-[#DE350B]" />}
                label="Overdue"
                value={stats.overdueTasks}
              />
              <QuickStat
                icon={<TrendingUp className="h-4 w-4 text-[#6554C0]" />}
                label="In Review"
                value={stats.tasksByStatus.review}
              />
            </div>
          </div>
        </div>

        {/* Project Progress Table */}
        {stats.projectTaskCounts.length > 0 && (
          <div className="bg-white rounded border border-[#DFE1E6] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DFE1E6]">
              <h3 className="text-sm font-semibold text-[#172B4D]">Project Progress</h3>
            </div>
            <div className="divide-y divide-[#DFE1E6]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-2.5 bg-[#FAFBFC] text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider">
                <span>Project</span>
                <span className="text-center">Issues</span>
                <span className="text-center">Done</span>
                <span>Progress</span>
                <span className="text-right">%</span>
              </div>
              {stats.projectTaskCounts.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-3 items-center hover:bg-[#FAFBFC] transition-colors"
                >
                  <span className="text-sm font-medium text-[#172B4D] truncate">{p.name}</span>
                  <span className="text-sm text-[#42526E] text-center">{p.total}</span>
                  <span className="text-sm text-[#00875A] font-medium text-center">{p.done}</span>
                  <div className="w-full bg-[#DFE1E6] rounded-full h-2">
                    <div
                      className="bg-[#00875A] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#172B4D] text-right">
                    {p.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white rounded border border-[#DFE1E6] p-4">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-[#172B4D]">{value}</div>
          <div className="text-xs text-[#6B778C] mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F4F5F7] last:border-0">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-[#42526E]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#172B4D]">{value}</span>
    </div>
  )
}
