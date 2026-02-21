/**
 * Loading Skeletons for each page.
 * Matches the real layout so the transition feels seamless.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// ── Projects Page Skeleton ──────────────────────────────────────

export function ProjectsPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3.5 w-36 mt-1.5" />
              </div>
            </div>
            <Skeleton className="h-8 w-[120px] rounded-[3px]" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Stats skeleton */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-7 w-10" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-[200px] rounded-[3px]" />
          <Skeleton className="h-8 w-[140px] rounded-[3px]" />
          <Skeleton className="h-8 w-[140px] rounded-[3px]" />
        </div>

        {/* Project cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4.5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Board Page Skeleton ─────────────────────────────────────────

export function BoardPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3.5 w-40 mt-1.5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-[180px] rounded-[3px]" />
              <Skeleton className="h-8 w-[110px] rounded-[3px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Columns skeleton */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-3 h-full min-h-[400px]">
          {["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"].map((label) => (
            <div
              key={label}
              className="flex flex-col w-[280px] min-w-[280px] rounded bg-muted/50"
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="flex-1 px-2 pb-2 space-y-2">
                {Array.from({ length: label === "IN PROGRESS" ? 3 : 2 }).map((_, i) => (
                  <BoardCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BoardCardSkeleton() {
  return (
    <div className="bg-card rounded border p-3 shadow-sm space-y-2">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-full" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-4 rounded-full ml-auto" />
      </div>
    </div>
  )
}

// ── Reports Page Skeleton ───────────────────────────────────────

export function ReportsPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded" />
            <div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3.5 w-64 mt-1.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div>
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-0">
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {Array.from({ length: i < 2 ? 4 : 5 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-3 h-3 rounded-sm shrink-0" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="flex-1 h-6 rounded-sm" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project progress table skeleton */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b px-5 py-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-2.5 bg-muted/50">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-3 w-10 mx-auto" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-6 ml-auto" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-3 items-center"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-8 mx-auto" />
                  <Skeleton className="h-4 w-6 mx-auto" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Settings Page Skeleton ──────────────────────────────────────

export function SettingsPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-56 mt-1.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
        {/* General Info card skeleton */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data & Storage card skeleton */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-48" />
              </div>
            ))}
            <div className="pt-2 space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-[110px] rounded" />
                <Skeleton className="h-8 w-[150px] rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance card skeleton */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-44" />
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-6 h-6 rounded" />
              ))}
              <Skeleton className="h-3 w-20 ml-2" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone card skeleton */}
        <Card className="overflow-hidden border-destructive/30">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-0 border-b border-destructive/30 bg-destructive/5 py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-64 mt-1" />
              </div>
              <Skeleton className="h-8 w-[100px] rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Backlog Page Skeleton ───────────────────────────────────────

export function BacklogPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div>
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3.5 w-44 mt-1.5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-[180px] rounded-[3px]" />
              <Skeleton className="h-8 w-[110px] rounded-[3px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-[200px] rounded-[3px]" />
          <Skeleton className="h-8 w-[140px] rounded-[3px]" />
          <Skeleton className="h-8 w-[140px] rounded-[3px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {["TO DO", "IN PROGRESS", "IN REVIEW"].map((section) => (
          <Card key={section} className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div>
              {Array.from({ length: section === "IN PROGRESS" ? 3 : 2 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_120px_100px_100px_100px_80px] gap-3 px-4 py-3 border-b items-center"
                >
                  <div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
