import { List, MoreHorizontal, SquareArrowOutUpRight } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mb-3 text-sm text-[#9fadbc]">Spaces / Support / Queues</div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[44px] font-semibold tracking-[-0.04em] text-white">All open</h1>
        </div>
        <div className="flex items-center gap-2 text-[#9fadbc]">
          <button type="button" className="jira-icon-button h-8 w-8" />
          <button type="button" className="jira-icon-button h-8 w-8" />
          <button type="button" className="jira-icon-button h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-5 border-b border-white/8 text-sm">
        <button type="button" className="flex items-center gap-2 border-b-2 border-[#579dff] pb-3 font-medium text-[#85b8ff]">
          <List className="h-4 w-4" />
          List
        </button>
        <button type="button" className="pb-3 text-[#9fadbc]">+</button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" className="jira-filter-chip min-w-[180px] justify-start text-[#7b8694]">Search work</button>
        <button type="button" className="jira-filter-chip">Request type</button>
        <button type="button" className="jira-filter-chip">Status</button>
        <button type="button" className="jira-filter-chip">Assignee</button>
        <button type="button" className="jira-filter-chip">More filters</button>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="rounded-[3px] border border-white/8 bg-[#2a3138] px-4 py-2 text-sm font-medium text-[#6b778c]">Triage</button>
          <button type="button" className="jira-icon-button">
            <SquareArrowOutUpRight className="h-4 w-4" />
          </button>
          <button type="button" className="jira-icon-button">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-[560px] place-items-center rounded-[28px] border border-white/8 bg-[#1f2328] text-center">
        <div>
          <div className="mx-auto mb-8 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff8a6f,#f15b50_45%,#ce3d34_100%)] opacity-90" />
          <h2 className="text-[42px] font-semibold tracking-[-0.04em] text-white">All of your requests will show up here</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-[#9fadbc]">
            Talk with customers, notify your teammates and track work all in one place. Create a request of your own to see it in action.
          </p>
          <button type="button" className="mt-8 rounded-[3px] bg-[#579dff] px-5 py-3 text-sm font-semibold text-[#0f1419]">Create a request</button>
        </div>
      </div>
    </div>
  )
}