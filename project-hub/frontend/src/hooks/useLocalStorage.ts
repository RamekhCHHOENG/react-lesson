import { useState, useCallback } from "react"

/**
 * useLocalStorage - Persists state in localStorage with type safety.
 * Demonstrates: useState lazy initializer, useCallback, try/catch, JSON serialization
 * Use case: Persisting user preferences (board layout, sidebar width, filters)
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // quota exceeded or private browsing
        }
        return nextValue
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch {
      // ignore
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
