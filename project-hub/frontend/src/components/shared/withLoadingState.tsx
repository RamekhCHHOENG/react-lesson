import { type ComponentType } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * withLoadingState — Higher-Order Component (HOC) Pattern
 *
 * Demonstrates the HOC pattern: a function that takes a component
 * and returns an enhanced component with loading/error/empty states.
 *
 * This is a classic React pattern that wraps components with
 * cross-cutting concerns (loading, error handling, empty states)
 * without modifying the original component.
 *
 * Usage:
 *   const EnhancedList = withLoadingState(TaskList, {
 *     loadingFallback: <CustomSkeleton />,
 *     emptyMessage: "No tasks found",
 *   })
 *   <EnhancedList data={tasks} isLoading={loading} error={error} />
 */

interface WithLoadingStateOptions {
  loadingFallback?: React.ReactNode
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  skeletonCount?: number
}

interface InjectedProps<T> {
  data: T[] | undefined
  isLoading: boolean
  error?: Error | null
  onRetry?: () => void
}

export function withLoadingState<T, P extends { data: T[] }>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingStateOptions = {},
) {
  const {
    loadingFallback,
    emptyMessage = "No items found",
    emptyIcon,
    skeletonCount = 5,
  } = options

  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component"

  function EnhancedComponent(props: Omit<P, "data"> & InjectedProps<T>) {
    const { data, isLoading, error, onRetry, ...rest } = props

    // Loading state
    if (isLoading) {
      return loadingFallback ?? (
        <div className="space-y-3 animate-in fade-in duration-300">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )
    }

    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
          <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try again
            </Button>
          )}
        </div>
      )
    }

    // Empty state
    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
          {emptyIcon ?? <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />}
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )
    }

    // Render wrapped component with data
    return <WrappedComponent {...(rest as unknown as P)} data={data} />
  }

  EnhancedComponent.displayName = `withLoadingState(${displayName})`
  return EnhancedComponent
}
