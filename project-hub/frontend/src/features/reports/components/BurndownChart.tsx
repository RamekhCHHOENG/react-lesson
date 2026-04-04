import { useBurndown } from "@/hooks/useReports"
import { useSprints } from "@/hooks/useSprints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useState } from "react"
import { TrendingDown } from "lucide-react"

interface BurndownChartProps {
  projectId: string
}

export function BurndownChart({ projectId }: BurndownChartProps) {
  const { data: sprints } = useSprints(projectId)
  const activeSprint = sprints?.find((s) => s.status === "active")
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")

  const sprintId = selectedSprintId || activeSprint?.id || ""
  const { data: burndown, isLoading } = useBurndown(projectId, sprintId || undefined)

  const sprintOptions = sprints?.filter((s) => s.status === "active" || s.status === "completed") ?? []

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Sprint Burndown
        </CardTitle>
        <Select value={sprintId} onValueChange={setSelectedSprintId}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue placeholder="Select sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprintOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !burndown || burndown.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            {!sprintId ? "Select a sprint to view burndown" : "No burndown data available"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={burndown}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
