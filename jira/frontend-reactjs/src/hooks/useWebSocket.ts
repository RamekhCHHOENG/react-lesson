import { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

const WS_BASE = import.meta.env.VITE_WS_URL ?? `ws://${window.location.hostname}:8000`
const MAX_RETRIES = 10
const BASE_DELAY = 1000

type WsEvent = {
  type: "task_created" | "task_updated" | "task_deleted" | "project_updated" | "sprint_updated" | "comment_created"
  data: Record<string, unknown>
}

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const msg: WsEvent = JSON.parse(event.data)

        switch (msg.type) {
          case "task_created":
          case "task_updated":
          case "task_deleted":
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.invalidateQueries({ queryKey: ["sprints"] })
            queryClient.invalidateQueries({ queryKey: ["epics"] })
            break
          case "project_updated":
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            break
          case "sprint_updated":
            queryClient.invalidateQueries({ queryKey: ["sprints"] })
            break
          case "comment_created":
            queryClient.invalidateQueries({ queryKey: ["comments"] })
            break
        }
      } catch {
        // ignore malformed messages
      }
    },
    [queryClient],
  )

  const connect = useCallback(() => {
    const token = localStorage.getItem("jira_token")
    if (!token) return

    const ws = new WebSocket(`${WS_BASE}/api/ws?token=${token}`)

    ws.onopen = () => {
      retriesRef.current = 0
    }

    ws.onmessage = handleMessage

    ws.onclose = () => {
      wsRef.current = null
      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retriesRef.current)
        retriesRef.current += 1
        timerRef.current = setTimeout(connect, delay)
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [handleMessage])

  useEffect(() => {
    connect()

    return () => {
      clearTimeout(timerRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])
}
