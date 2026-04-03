import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, X } from "lucide-react"

/**
 * FilterBar — Compound Components Pattern
 *
 * Demonstrates the compound component pattern where a parent component
 * shares state with its children through Context API, allowing flexible
 * composition without prop drilling.
 *
 * Usage:
 *   <FilterBar onFiltersChange={handleChange}>
 *     <FilterBar.Search placeholder="Search..." />
 *     <FilterBar.Group label="Status">
 *       <FilterBar.Chip value="todo">To Do</FilterBar.Chip>
 *       <FilterBar.Chip value="done">Done</FilterBar.Chip>
 *     </FilterBar.Group>
 *     <FilterBar.ClearButton />
 *     <FilterBar.ActiveCount />
 *   </FilterBar>
 */

// ── Context ────────────────────────────────────────────────────────────────

interface FilterBarContextValue {
  filters: Record<string, Set<string>>
  searchQuery: string
  toggleFilter: (group: string, value: string) => void
  setSearchQuery: (q: string) => void
  clearAll: () => void
  getActiveCount: () => number
}

const FilterBarContext = createContext<FilterBarContextValue | null>(null)

function useFilterBar() {
  const ctx = useContext(FilterBarContext)
  if (!ctx) throw new Error("FilterBar compound components must be used inside <FilterBar>")
  return ctx
}

// ── Root Component ────────────────────────────────────────────────────

interface FilterBarProps {
  children: ReactNode
  onFiltersChange?: (filters: Record<string, string[]>, searchQuery: string) => void
  className?: string
}

function FilterBarRoot({ children, onFiltersChange, className }: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, Set<string>>>({})
  const [searchQuery, setSearchQueryState] = useState("")

  const toggleFilter = useCallback((group: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev }
      const set = new Set(next[group] ?? [])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      if (set.size === 0) delete next[group]
      else next[group] = set
      
      // Notify parent
      const serialized: Record<string, string[]> = {}
      for (const [k, v] of Object.entries(next)) serialized[k] = [...v]
      onFiltersChange?.(serialized, searchQuery)
      
      return next
    })
  }, [onFiltersChange, searchQuery])

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q)
    const serialized: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(filters)) serialized[k] = [...v]
    onFiltersChange?.(serialized, q)
  }, [onFiltersChange, filters])

  const clearAll = useCallback(() => {
    setFilters({})
    setSearchQueryState("")
    onFiltersChange?.({}, "")
  }, [onFiltersChange])

  const getActiveCount = useCallback(() => {
    let count = searchQuery ? 1 : 0
    for (const set of Object.values(filters)) count += set.size
    return count
  }, [filters, searchQuery])

  return (
    <FilterBarContext.Provider value={{ filters, searchQuery, toggleFilter, setSearchQuery, clearAll, getActiveCount }}>
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {children}
      </div>
    </FilterBarContext.Provider>
  )
}

// ── Search ────────────────────────────────────────────────────────────

function FilterBarSearch({ placeholder = "Search..." }: { placeholder?: string }) {
  const { searchQuery, setSearchQuery } = useFilterBar()
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder={placeholder}
      className="h-8 w-48 rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
    />
  )
}

// ── Filter Group ────────────────────────────────────────────────────────

function FilterBarGroup({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { filters } = useFilterBar()
  const activeInGroup = filters[label]?.size ?? 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-8 px-3 rounded-md border text-xs font-bold flex items-center gap-1.5 transition-all",
          activeInGroup > 0
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
        )}
      >
        {label}
        {activeInGroup > 0 && (
          <span className="h-4 min-w-[16px] px-1 rounded-full bg-primary text-[9px] text-primary-foreground font-black flex items-center justify-center">
            {activeInGroup}
          </span>
        )}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <FilterBarGroupContext.Provider value={label}>
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {children}
            </div>
          </div>
        </FilterBarGroupContext.Provider>
      )}
    </div>
  )
}

const FilterBarGroupContext = createContext<string>("")

// ── Chip (inside Group) ────────────────────────────────────────────────

function FilterBarChip({ value, children, color }: { value: string; children: ReactNode; color?: string }) {
  const group = useContext(FilterBarGroupContext)
  const { filters, toggleFilter } = useFilterBar()
  const active = filters[group]?.has(value) ?? false

  return (
    <button
      onClick={() => toggleFilter(group, value)}
      className={cn(
        "px-2.5 py-1.5 rounded text-[11px] font-bold transition-all text-left",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-secondary/60",
      )}
      style={active && color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </button>
  )
}

// ── Clear Button ────────────────────────────────────────────────────────

function FilterBarClearButton() {
  const { clearAll, getActiveCount } = useFilterBar()
  const count = getActiveCount()
  if (count === 0) return null

  return (
    <button
      onClick={clearAll}
      className="h-8 px-2.5 rounded-md text-[11px] font-bold text-destructive hover:bg-destructive/10 flex items-center gap-1 transition-all animate-in fade-in zoom-in duration-200"
    >
      <X className="h-3 w-3" /> Clear ({count})
    </button>
  )
}

// ── Active Count ────────────────────────────────────────────────────────

function FilterBarActiveCount() {
  const { getActiveCount } = useFilterBar()
  const count = getActiveCount()
  if (count === 0) return null

  return (
    <span className="text-[11px] font-bold text-muted-foreground">
      {count} filter{count !== 1 ? "s" : ""} active
    </span>
  )
}

// ── Compose compound component ────────────────────────────────────────

export const FilterBar = Object.assign(FilterBarRoot, {
  Search: FilterBarSearch,
  Group: FilterBarGroup,
  Chip: FilterBarChip,
  ClearButton: FilterBarClearButton,
  ActiveCount: FilterBarActiveCount,
})
