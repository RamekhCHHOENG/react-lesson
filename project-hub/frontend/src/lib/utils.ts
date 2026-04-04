import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isBefore, isAfter, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMM d, yyyy")
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMM d, yyyy h:mm a")
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === "string" ? parseISO(date) : date
  return isBefore(d, new Date())
}

export function isDueSoon(date: string | Date | null | undefined, days = 3): boolean {
  if (!date) return false
  const d = typeof date === "string" ? parseISO(date) : date
  const soon = new Date()
  soon.setDate(soon.getDate() + days)
  return isAfter(d, new Date()) && isBefore(d, soon)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}
