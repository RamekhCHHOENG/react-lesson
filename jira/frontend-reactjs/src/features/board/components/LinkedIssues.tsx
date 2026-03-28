import { useState } from "react"
import { useLinkedIssues, useLinkIssue, useUnlinkIssue, useAllTasks } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, X, Link2, ArrowRight, ArrowLeft, GitCompare, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { TASK_STATUS_CONFIG } from "@/config"
import type { LinkedIssue, LinkType } from "@/types"

const LINK_TYPES: { value: LinkType; label: string; icon: typeof Link2 }[] = [
  { value: "blocks", label: "Blocks", icon: ArrowRight },
  { value: "is-blocked-by", label: "Is blocked by", icon: ArrowLeft },
  { value: "relates-to", label: "Relates to", icon: GitCompare },
  { value: "duplicates", label: "Duplicates", icon: Copy },
]

interface LinkedIssuesProps {
  projectId: string
  taskId: string
}

export function LinkedIssues({ projectId, taskId }: LinkedIssuesProps) {
  const { data: links, isLoading } = useLinkedIssues(projectId, taskId)
  const linkIssue = useLinkIssue()
  const unlinkIssue = useUnlinkIssue()
  const { data: allTasks } = useAllTasks()

  const [showForm, setShowForm] = useState(false)
  const [linkType, setLinkType] = useState<LinkType>("relates-to")
  const [search, setSearch] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [unlinkTarget, setUnlinkTarget] = useState<LinkedIssue | null>(null)

  const filteredTasks = allTasks?.filter(
    (t) =>
      t.id !== taskId &&
      !links?.some((l) => l.task.id === t.id) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.issue_key.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8)

  const handleLink = () => {
    if (!selectedTaskId) return
    linkIssue.mutate(
      { projectId, taskId, targetTaskId: selectedTaskId, linkType },
      { onSuccess: () => { setShowForm(false); setSearch(""); setSelectedTaskId("") } }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Linked issues list */}
      {links && links.length > 0 ? (
        <div className="space-y-1">
          {links.map((link) => {
            const linkCfg = LINK_TYPES.find((l) => l.value === link.link_type)
            const statusCfg = TASK_STATUS_CONFIG[link.task.status]
            const Icon = linkCfg?.icon ?? Link2
            return (
              <div key={link.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50 group">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground shrink-0 w-20 truncate">
                  {linkCfg?.label}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{link.task.issue_key}</span>
                <span className="text-sm truncate flex-1">{link.task.title}</span>
                <Badge variant="outline" className={cn("text-[10px]", statusCfg?.color)}>
                  {statusCfg?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setUnlinkTarget(link)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No linked issues</p>
      )}

      {/* Add link form */}
      {showForm ? (
        <div className="space-y-2 rounded-md border p-3">
          <Select value={linkType} onValueChange={(v) => setLinkType(v as LinkType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINK_TYPES.map((lt) => (
                <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by title or key..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedTaskId("") }}
            className="h-8 text-sm"
            autoFocus
          />

          {search && filteredTasks && filteredTasks.length > 0 && (
            <div className="max-h-40 overflow-auto space-y-0.5">
              {filteredTasks.map((t) => (
                <button
                  key={t.id}
                  className={cn(
                    "w-full flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent",
                    selectedTaskId === t.id && "bg-accent"
                  )}
                  onClick={() => { setSelectedTaskId(t.id); setSearch(t.issue_key + " " + t.title) }}
                >
                  <span className="text-xs font-mono text-muted-foreground">{t.issue_key}</span>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="h-7" onClick={handleLink} disabled={!selectedTaskId || linkIssue.isPending}>
              Link
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => { setShowForm(false); setSearch(""); setSelectedTaskId("") }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Link issue
        </Button>
      )}

      {/* Unlink dialog */}
      <AlertDialog open={!!unlinkTarget} onOpenChange={() => setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Link</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the link to "{unlinkTarget?.task.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unlinkTarget) {
                  unlinkIssue.mutate(
                    { projectId, taskId, linkId: unlinkTarget.id },
                    { onSuccess: () => setUnlinkTarget(null) }
                  )
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
