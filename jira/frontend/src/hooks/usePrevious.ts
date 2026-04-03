import { useRef, useEffect } from "react"

/**
 * usePrevious - Tracks the previous value of a variable across renders.
 * Demonstrates: useRef to persist values without triggering re-renders, useEffect
 * Use case: Comparing current vs previous state, detecting changes, animations
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
