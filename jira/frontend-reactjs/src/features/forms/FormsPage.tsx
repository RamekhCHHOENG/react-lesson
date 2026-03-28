import { BarChart3, ClipboardList, Send } from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"

export default function FormsPage() {
  return (
    <JiraWorkspaceFrame tab="forms">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <section className="jira-panel p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[36px] font-semibold tracking-[-0.03em] text-white">Forms</h2>
              <p className="text-sm text-[#9fadbc]">Collect structured requests directly in your project space.</p>
            </div>
            <button type="button" className="rounded-[3px] bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0f1419]">Create form</button>
          </div>

          <div className="space-y-4">
            {[
              { title: "Bug report intake", submissions: 18, icon: ClipboardList },
              { title: "Access request", submissions: 7, icon: Send },
              { title: "Feedback collection", submissions: 24, icon: BarChart3 },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-[22px] border border-white/8 bg-[#1f2328] p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-[3px] bg-[#253247] text-[#85b8ff]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-white">{item.title}</div>
                    <div className="text-sm text-[#9fadbc]">{item.submissions} submissions this month</div>
                  </div>
                </div>
                <button type="button" className="jira-filter-chip">Manage</button>
              </div>
            ))}
          </div>
        </section>

        <aside className="jira-panel p-6">
          <div className="mb-5 text-[30px] font-semibold tracking-[-0.03em] text-white">Insights</div>
          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-[#1f2328] p-5">
              <div className="text-[42px] font-semibold tracking-[-0.04em] text-white">49</div>
              <div className="text-sm text-[#9fadbc]">Total submissions</div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-[#1f2328] p-5">
              <div className="text-[42px] font-semibold tracking-[-0.04em] text-white">82%</div>
              <div className="text-sm text-[#9fadbc]">Auto-routed without manual triage</div>
            </div>
          </div>
        </aside>
      </div>
    </JiraWorkspaceFrame>
  )
}