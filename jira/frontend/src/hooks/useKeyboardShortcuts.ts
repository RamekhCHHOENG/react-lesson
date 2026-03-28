import { useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"

interface ShortcutDef {
  key: string
  label: string
  category: string
  handler: () => void
}

export function useKeyboardShortcuts(
  onOpenSearch?: () => void,
  onOpenShortcutsHelp?: () => void,
) {
  const navigate = useNavigate()
  const pendingG = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable

      // Cmd+K for search (always works)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenSearch?.()
        return
      }

      // Don't trigger other shortcuts when typing in inputs
      if (isInput) return

      // ? for shortcuts help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onOpenShortcutsHelp?.()
        return
      }

      // G + key navigation
      if (pendingG.current) {
        pendingG.current = false
        clearTimeout(timerRef.current)

        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault()
            navigate("/")
            return
          case "p":
            e.preventDefault()
            navigate("/projects")
            return
          case "b":
            e.preventDefault()
            navigate("/board")
            return
          case "l":
            e.preventDefault()
            navigate("/backlog")
            return
          case "s":
            e.preventDefault()
            navigate("/sprints")
            return
          case "e":
            e.preventDefault()
            navigate("/epics")
            return
          case "t":
            e.preventDefault()
            navigate("/team")
            return
          case "r":
            e.preventDefault()
            navigate("/reports")
            return
        }
        return
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        pendingG.current = true
        timerRef.current = setTimeout(() => {
          pendingG.current = false
        }, 500)
        return
      }
    },
    [navigate, onOpenSearch, onOpenShortcutsHelp],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [handleKeyDown])
}

export const SHORTCUTS: ShortcutDef[] = [
  { key: "⌘ K", label: "Open search", category: "Global", handler: () => {} },
  { key: "?", label: "Show keyboard shortcuts", category: "Global", handler: () => {} },
  { key: "G then D", label: "Go to Dashboard", category: "Navigation", handler: () => {} },
  { key: "G then P", label: "Go to Projects", category: "Navigation", handler: () => {} },
  { key: "G then B", label: "Go to Board", category: "Navigation", handler: () => {} },
  { key: "G then L", label: "Go to Backlog", category: "Navigation", handler: () => {} },
  { key: "G then S", label: "Go to Sprints", category: "Navigation", handler: () => {} },
  { key: "G then E", label: "Go to Epics", category: "Navigation", handler: () => {} },
  { key: "G then T", label: "Go to Team", category: "Navigation", handler: () => {} },
  { key: "G then R", label: "Go to Reports", category: "Navigation", handler: () => {} },
]
