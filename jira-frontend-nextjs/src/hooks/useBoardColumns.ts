import { useState, useCallback } from "react"

export interface BoardColumn {
  key: string
  label: string
  headerColor: string
  isDefault?: boolean
}

const STORAGE_KEY = "projecthub_board_columns"

export const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  { key: "todo", label: "TO DO", headerColor: "#6B778C", isDefault: true },
  { key: "in-progress", label: "IN PROGRESS", headerColor: "#0065FF", isDefault: true },
  { key: "review", label: "IN REVIEW", headerColor: "#6554C0", isDefault: true },
  { key: "done", label: "DONE", headerColor: "#36B37E", isDefault: true },
]

function loadColumns(): BoardColumn[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const custom = JSON.parse(stored) as BoardColumn[]
      return [...DEFAULT_BOARD_COLUMNS, ...custom]
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_BOARD_COLUMNS]
}

function saveCustomColumns(columns: BoardColumn[]) {
  const custom = columns.filter((c) => !c.isDefault)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
}

export function useBoardColumns() {
  const [columns, setColumns] = useState<BoardColumn[]>(loadColumns)

  const addColumn = useCallback((label: string, headerColor: string) => {
    const key = label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    setColumns((prev) => {
      if (prev.some((c) => c.key === key)) return prev
      const newCol: BoardColumn = { key, label, headerColor }
      const updated = [...prev, newCol]
      saveCustomColumns(updated)
      return updated
    })
    return key
  }, [])

  const removeColumn = useCallback((key: string) => {
    setColumns((prev) => {
      const col = prev.find((c) => c.key === key)
      if (!col || col.isDefault) return prev
      const updated = prev.filter((c) => c.key !== key)
      saveCustomColumns(updated)
      return updated
    })
  }, [])

  return { columns, addColumn, removeColumn }
}
