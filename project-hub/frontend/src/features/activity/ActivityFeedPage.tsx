import { useState, useMemo } from "react"
import { useActivities } from "@/hooks/useActivities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Activity, Plus, Pencil, Trash2, MessageSquare, RefreshCw, UserPlus, ArrowUpRight, Filter,
} from "lucide-react"
import { timeAgo, getInitials, cn } from "@/lib/utils"
import { ACTIVITY_ACTION_CONFIG } from "@/config"
import type { ActivityAction, ActivityEntityType } from "@/types"

const ACTION_ICONS: Record<string, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  commented: MessageSquare,
  status_changed: RefreshCw,
  assigned: UserPlus,
  moved: ArrowUpRight,
}

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
  commented: "bg-purple-100 text-purple-700",
  status_changed: "bg-yellow-100 text-yellow-700",
  assigned: "bg-cyan-100 text-cyan-700",
  moved: "bg-orange-100 text-orange-700",
}

export default function ActivityFeedPage() {
  const { data: activities, isLoading } = useActivities()
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [visibleCount, setVisibleCount] = useState(30)

  const filtered = useMemo(() => {
    if (!activities) return []
    return activities.filter((a) => {
      if (actionFilter !== "all" && a.action !== actionFilter) return false
      if (entityFilter !== "all" && a.entity_type !== entityFilter) return false
      return true
    })
  }, [activities, actionFilter, entityFilter])

  const visible = filtered.slice(0, visibleCount)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground mt-1">Recent activity across your workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {(Object.keys(ACTIVITY_ACTION_CONFIG) as ActivityAction[]).map((action) => (
                <SelectItem key={action} value={action}>
                  {ACTIVITY_ACTION_CONFIG[action].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(["project", "task", "sprint", "comment"] as ActivityEntityType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[700px]">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Activity className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">No activity found</p>
              </div>
            ) : (
              <div className="divide-y">
                {visible.map((activity) => {
                  const actionCfg = ACTIVITY_ACTION_CONFIG[activity.action]
                  const Icon = ACTION_ICONS[activity.action] ?? Activity
                  const colorClass = ACTION_COLORS[activity.action] ?? "bg-muted text-muted-foreground"
                  const userName = activity.user_name ?? "Unknown"
                  const details = activity.details as Record<string, string> | null

                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-accent/30 transition-colors">
                      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{userName}</span>{" "}
                          <span className="text-muted-foreground">{actionCfg?.label ?? activity.action}</span>{" "}
                          {activity.entity_title && (
                            <span className="font-medium">{activity.entity_title}</span>
                          )}
                          {" "}
                          <Badge variant="outline" className="text-[10px] align-middle">
                            {activity.entity_type}
                          </Badge>
                        </p>
                        {details?.field && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {details.field}:{" "}
                            {details.old_value && <span className="line-through">{details.old_value}</span>}
                            {details.old_value && details.new_value && " → "}
                            {details.new_value && <span className="font-medium">{details.new_value}</span>}
                          </p>
                        )}
                        {activity.project_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            in {activity.project_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(activity.created_at)}</p>
                      </div>
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
          {visible.length < filtered.length && (
            <div className="p-3 border-t text-center">
              <Button variant="ghost" size="sm" onClick={() => setVisibleCount((c) => c + 30)}>
                Load more ({filtered.length - visible.length} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
