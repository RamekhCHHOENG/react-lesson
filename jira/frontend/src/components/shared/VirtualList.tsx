import { useState, useEffect, useRef, type ReactNode, type RefObject, memo } from "react"

/**
 * VirtualList — Render Props Pattern
 *
 * Demonstrates the render props pattern: a component that accepts a function
 * as children (or a render prop) to delegate rendering to the consumer.
 *
 * This enables powerful composition where the VirtualList handles scroll
 * virtualization logic, but the consumer controls how each item is rendered.
 *
 * Also demonstrates: useRef, useEffect, IntersectionObserver, memo
 *
 * Usage:
 *   <VirtualList
 *     items={tasks}
 *     itemHeight={64}
 *     containerHeight={600}
 *     renderItem={(task, index, style) => (
 *       <div style={style}><TaskRow task={task} /></div>
 *     )}
 *   />
 *
 *   // Or with children as render prop:
 *   <VirtualList items={tasks} itemHeight={64} containerHeight={600}>
 *     {(task, index, style) => <div style={style}>{task.title}</div>}
 *   </VirtualList>
 */

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
  renderItem?: (item: T, index: number, style: React.CSSProperties) => ReactNode
  children?: (item: T, index: number, style: React.CSSProperties) => ReactNode
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
}

function VirtualListInner<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  children,
  className,
  onEndReached,
  endReachedThreshold = 200,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const endReachedRef = useRef(false)

  const render = renderItem ?? children
  if (!render) {
    throw new Error("VirtualList requires either a renderItem prop or children as a render function")
  }

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  )

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    const style: React.CSSProperties = {
      position: "absolute",
      top: i * itemHeight,
      height: itemHeight,
      width: "100%",
    }
    visibleItems.push(
      <div key={i}>
        {render(items[i], i, style)}
      </div>,
    )
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)

      // Check if near end
      if (onEndReached) {
        const distanceFromEnd = totalHeight - container.scrollTop - containerHeight
        if (distanceFromEnd < endReachedThreshold && !endReachedRef.current) {
          endReachedRef.current = true
          onEndReached()
        } else if (distanceFromEnd >= endReachedThreshold) {
          endReachedRef.current = false
        }
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [totalHeight, containerHeight, endReachedThreshold, onEndReached])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: containerHeight, overflow: "auto", position: "relative" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  )
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner
