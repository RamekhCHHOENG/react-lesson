import { FileText, Plus, Star } from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"

export default function PagesPage() {
  return (
    <JiraWorkspaceFrame tab="pages">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="jira-panel p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[36px] font-semibold tracking-[-0.03em] text-white">Pages</h2>
              <p className="text-sm text-[#9fadbc]">Capture specs, notes, and decisions next to delivery work.</p>
            </div>
            <button type="button" className="rounded-[3px] bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0f1419]">Create page</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Release checklist",
              "Sprint planning notes",
              "API contract decisions",
              "Customer research summary",
            ].map((title) => (
              <article key={title} className="rounded-[22px] border border-white/8 bg-[#1f2328] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-[3px] bg-[#253247] text-[#85b8ff]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Star className="h-4 w-4 text-[#f5cd47]" />
                </div>
                <h3 className="text-xl font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#9fadbc]">Keep project context visible without leaving the Jira workspace.</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="jira-panel p-6">
          <div className="mb-5 text-[30px] font-semibold tracking-[-0.03em] text-white">Templates</div>
          <div className="space-y-3">
            {[
              "Product requirements",
              "Incident retrospective",
              "Weekly team update",
            ].map((item) => (
              <button key={item} type="button" className="flex w-full items-center justify-between rounded-md border border-white/8 bg-[#1f2328] px-4 py-3 text-left text-sm text-[#dfe1e6]">
                <span>{item}</span>
                <Plus className="h-4 w-4 text-[#9fadbc]" />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </JiraWorkspaceFrame>
  )
}