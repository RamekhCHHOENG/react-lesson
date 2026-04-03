import { useEffect, useRef, useState, type RefObject } from "react"

/**
 * useIntersectionObserver - Detects when elements enter/leave the viewport.
 * Demonstrates: useRef, useEffect cleanup, IntersectionObserver API, generics
 * Use case: Lazy loading images, infinite scroll, animation triggers
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}
