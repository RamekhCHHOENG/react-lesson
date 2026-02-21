import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  try {
    return format(new Date(date), fmt)
  } catch {
    return String(date)
  }
}
