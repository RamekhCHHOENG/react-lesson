import { useActivities } from "@/hooks/useActivities"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getInitials, timeAgo } from "@/lib/utils"
import { ACTIVITY_ACTION_CONFIG } from "@/config"
import type { Activity } from "@/types"

interface ActivityTimelineProps {
  projectId?: string
  taskId?: string
}

export function ActivityTimeline({ projectId, taskId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useActivities({ projectId, taskId })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (!activities?.length) {
    return <p className="text-center text-sm text-muted-foreground py-4">No activity yet</p>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = ACTIVITY_ACTION_CONFIG[activity.action]
  const details = activity.details as Record<string, string> | null

  return (
    <div className="flex gap-3 text-sm">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarFallback className="text-[10px]">
          {getInitials(activity.user_name ?? "?")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.user_name ?? "Someone"}</span>{" "}
          <span className="text-muted-foreground">{config?.label ?? activity.action}</span>{" "}
          {activity.entity_title && (
            <span className="font-medium">{activity.entity_title}</span>
          )}
          {" "}
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {activity.entity_type}
          </Badge>
        </p>
        {details?.field && details.old_value && details.new_value && (
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="line-through">{details.old_value}</span>
            {" → "}
            <span className="font-medium text-foreground">{details.new_value}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(activity.created_at)}</p>
      </div>
    </div>
  )
}
