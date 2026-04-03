import { GitBranch, GitMerge, Link2 } from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"

export default function CodePage() {
  return (
    <JiraWorkspaceFrame tab="code">
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8 h-48 w-72">
            <div className="absolute left-10 top-0 h-28 w-44 rotate-[-3deg] rounded-md border border-[#c97cf4]/40 bg-[#c97cf4]/20 shadow-[0_20px_40px_rgba(0,0,0,0.2)]" />
            <div className="absolute right-0 top-4 h-28 w-44 rotate-[2deg] rounded-md border border-[#579dff]/40 bg-[#579dff]/20 shadow-[0_20px_40px_rgba(0,0,0,0.2)]" />
            <div className="absolute left-8 top-10 h-28 w-60 rounded-md border border-white/10 bg-black px-6 py-5 text-left shadow-[0_26px_48px_rgba(0,0,0,0.35)]">
              <div className="mb-4 h-2 w-24 rounded-full bg-[#6b778c]" />
              <div className="flex items-center justify-between text-[#dfe1e6]">
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded bg-[#1f6feb]">
                    <GitBranch className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[22px] font-medium tracking-[-0.02em]">kan-251</span>
                </div>
                <GitMerge className="h-5 w-5 text-[#c97cf4]" />
              </div>
            </div>
          </div>

          <h2 className="text-[44px] font-semibold tracking-[-0.04em] text-white">Connect your code to ProjectHub</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-[#9fadbc]">
            Minimize context switching and gain visibility of your team’s pull requests and development workflow.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button type="button" className="jira-filter-chip px-6">
              <GitBranch className="h-4 w-4" />
              Connect GitHub
            </button>
            <button type="button" className="jira-filter-chip px-6">
              <Link2 className="h-4 w-4" />
              Connect GitLab
            </button>
            <button type="button" className="jira-filter-chip px-6">
              <Link2 className="h-4 w-4" />
              Connect Bitbucket
            </button>
          </div>

          <div className="mt-6 text-sm text-[#85b8ff] underline underline-offset-4">Explore other integrations</div>
        </div>
      </div>
    </JiraWorkspaceFrame>
  )
}