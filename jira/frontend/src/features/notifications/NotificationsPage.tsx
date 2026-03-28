import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/useNotifications"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, CheckCheck, MessageSquare, UserPlus, Zap, AlertCircle, ArrowRightCircle } from "lucide-react"
import { timeAgo, cn } from "@/lib/utils"
import type { Notification } from "@/types"

const NOTIF_ICONS: Record<string, typeof Bell> = {
  task_assigned: UserPlus,
  comment_added: MessageSquare,
  status_changed: ArrowRightCircle,
  mention: AlertCircle,
  sprint_started: Zap,
  sprint_completed: CheckCheck,
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            {notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications?.map((notif, i) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    isLast={i === notifications.length - 1}
                    onMarkRead={() => markRead.mutate(notif.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationItem({
  notification,
  isLast,
  onMarkRead,
}: {
  notification: Notification
  isLast: boolean
  onMarkRead: () => void
}) {
  const Icon = NOTIF_ICONS[notification.type] ?? Bell

  return (
    <>
      <button
        onClick={() => {
          if (!notification.is_read) onMarkRead()
        }}
        className={cn(
          "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50",
          !notification.is_read && "bg-primary/5"
        )}
      >
        <div className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          !notification.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm", !notification.is_read && "font-medium")}>{notification.title}</p>
            {!notification.is_read && (
              <Badge className="h-4 px-1 text-[10px] bg-primary">New</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
        </div>
      </button>
      {!isLast && <Separator />}
    </>
  )
}
