import { useState, useEffect } from "react"

/**
 * useDebounce - Delays updating a value until a specified delay has passed.
 * Demonstrates: useState, useEffect with cleanup, generic types
 * Use case: Search input debouncing to avoid excessive API calls
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
