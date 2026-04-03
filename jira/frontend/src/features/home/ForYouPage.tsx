import { useState, useMemo, useCallback, memo } from "react"
import { Bell, CheckSquare2, Sparkles, TrendingUp, Clock, Zap, BarChart3 } from "lucide-react"
import { useAuth } from "@/store/auth"
import { useProjectContext } from "@/store/project-context"
import { timeAgo } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Skeleton } from "@/components/ui/skeleton"

type TabKey = "worked" | "viewed" | "assigned" | "starred" | "boards"

export default function ForYouPage() {
  const { user } = useAuth()
  const { projects, selectedProject, isLoading } = useProjectContext()
  const [activeTab, setActiveTab] = useLocalStorage<TabKey>("jira-foryou-tab", "worked")

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
  }, [setActiveTab])

  if (isLoading) {
    return (
      <div className="px-6 py-8 md:px-11 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const project = selectedProject ?? projects[0] ?? null

  // useMemo — expensive task computation
  const allTasks = useMemo(() =>
    projects.flatMap((item) => item.tasks.map((task) => ({ ...task, projectName: item.name }))),
    [projects],
  )

  const filteredTasks = useMemo(() => {
    const userName = user?.full_name ?? ""
    const sortByDate = (a: typeof allTasks[0], b: typeof allTasks[0]) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()

    switch (activeTab) {
      case "assigned":
        return allTasks.filter((t) => t.assignee === userName).sort(sortByDate)
      case "starred":
        return allTasks.filter((t) => t.priority === "urgent" || t.priority === "high").sort(sortByDate)
      case "boards":
        return allTasks.filter((t) => t.status === "in-progress" || t.status === "review").sort(sortByDate)
      default:
        return [...allTasks].sort(sortByDate)
    }
  }, [allTasks, activeTab, user?.full_name])

  // useMemo — dashboard stats
  const stats = useMemo(() => {
    const total = allTasks.length
    const done = allTasks.filter((t) => t.status === "done").length
    const inProgress = allTasks.filter((t) => t.status === "in-progress" || t.status === "review").length
    const highPriority = allTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length
    return { total, done, inProgress, highPriority, completionRate: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [allTasks])

  const recentTasks = filteredTasks

  const todayItems = recentTasks.slice(0, 3)
  const monthItems = recentTasks.slice(3, 8)

  return (
    <div className="px-6 py-8 md:px-11">
      <div className="mb-8">
        <h1 className="text-[42px] font-semibold tracking-[-0.03em] text-white">For you</h1>
        <p className="text-sm text-[#9fadbc] mt-1">Welcome back, {user?.full_name ?? "there"}</p>
      </div>

      {/* Quick Stats — using useMemo computed values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <QuickStatCard icon={BarChart3} label="Total Issues" value={stats.total} color="text-blue-400" />
        <QuickStatCard icon={CheckSquare2} label="Completed" value={`${stats.completionRate}%`} color="text-green-400" />
        <QuickStatCard icon={TrendingUp} label="In Progress" value={stats.inProgress} color="text-yellow-400" />
        <QuickStatCard icon={Zap} label="High Priority" value={stats.highPriority} color="text-red-400" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          <div className="mb-6 flex items-center gap-5 text-sm">
            <button type="button" className="rounded-full bg-[#253247] px-4 py-1.5 font-medium text-[#85b8ff]">
              Recommended
            </button>
            <button type="button" className="text-[#9fadbc]">Recent</button>
            <button type="button" className="text-[#c6a3e8] underline underline-offset-4">View all spaces</button>
          </div>

          <section className="jira-panel p-6">
            <div className="mb-5 text-[30px] font-semibold tracking-[-0.02em] text-white">Recommended spaces</div>
            <div className="max-w-[280px] rounded-md border border-white/8 bg-[#1f2328] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-[3px] bg-[#f87462] text-sm font-bold text-[#1d2125]">
                {project?.key?.charAt(0) ?? "M"}
              </div>
              <div className="text-[30px] font-semibold leading-none text-white">{project?.name ?? "My Software Team"}</div>
              <div className="mt-2 text-sm text-[#9fadbc]">Software space</div>
              <div className="mt-8 flex items-center gap-2 text-xs text-[#9fadbc]">
                <Sparkles className="h-3.5 w-3.5 text-[#85b8ff]" />
                Popular with teammates
              </div>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center gap-6 border-b border-white/8 text-sm text-[#9fadbc]">
              {(["worked", "viewed", "assigned", "starred", "boards"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={activeTab === key ? "border-b-2 border-[#579dff] pb-3 font-medium text-[#85b8ff]" : "pb-3"}
                >
                  {{worked:"Worked on",viewed:"Viewed",assigned:"Assigned to me",starred:"Starred",boards:"Boards"}[key]}
                </button>
              ))}
            </div>

            <div className="space-y-7 pt-3">
              <TaskGroup label="Today" items={todayItems} />
              <TaskGroup label="In the last month" items={monthItems} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <aside className="jira-panel overflow-hidden">
            <div className="h-28 bg-[linear-gradient(135deg,#1e4db7,#4b8bf4_65%,#6ea5ff)]" />
            <div className="space-y-2 p-5">
              <div className="text-[34px] font-semibold tracking-[-0.03em] text-white">Jira Service Management</div>
              <p className="text-sm leading-6 text-[#9fadbc]">
                Link your teams, make work visible. Connect support teams with development teams to get the full picture.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" className="rounded-[3px] bg-[#2a3138] px-4 py-2 text-sm font-medium text-white">Try it now</button>
                <button type="button" className="rounded-[3px] px-2 py-2 text-sm text-[#9fadbc]">Learn more</button>
              </div>
            </div>
          </aside>

          <aside className="jira-panel overflow-hidden">
            <div className="h-28 bg-[radial-gradient(circle_at_top_left,#f8d3ff,transparent_45%),linear-gradient(135deg,#efc1ff,#d5b2f5_58%,#f4d6df)]" />
            <div className="space-y-2 p-5">
              <div className="text-[32px] font-semibold leading-9 tracking-[-0.03em] text-white">Supercharge your IT teams with operations</div>
              <p className="text-sm leading-6 text-[#9fadbc]">
                Create on-call schedules and track alerts to resolve incidents faster, all powered by Jira Service Management.
              </p>
              <div className="flex items-center justify-between pt-3">
                <button type="button" className="rounded-[3px] bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0f1419]">Let’s start</button>
                <span className="text-xs text-[#9fadbc]">Why am I seeing this?</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-8 text-sm text-[#9fadbc]">Signed in as {user?.full_name ?? "Workspace member"}</div>
    </div>
  )
}

// React.memo — QuickStatCard only re-renders when its props change
const QuickStatCard = memo(function QuickStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#22272b] p-4 transition-all hover:border-white/15 hover:bg-[#272d33]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-[#9fadbc]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
})

// React.memo — TaskGroup prevents re-renders unless items change
const TaskGroup = memo(function TaskGroup({
  label,
  items,
}: {
  label: string
  items: Array<{ id: string; title: string; issue_key: string; projectName: string; updated_at: string }>
}) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9fadbc]">{label}</div>
      <div className="space-y-2">
        {items.length === 0 && <div className="rounded-md border border-dashed border-white/10 p-5 text-sm text-[#9fadbc]">No recent work items.</div>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-md border border-white/8 bg-[#22272b] px-4 py-3 transition-colors hover:bg-[#272d33]">
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-[#253247] text-[#85b8ff]">
              <CheckSquare2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[22px] font-medium tracking-[-0.02em] text-white">{item.title}</div>
              <div className="text-sm text-[#9fadbc]">{item.issue_key} · {item.projectName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#9fadbc]">Created</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#9fadbc]">
                <Bell className="h-3.5 w-3.5" />
                {timeAgo(item.updated_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})