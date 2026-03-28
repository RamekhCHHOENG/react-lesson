import { useVelocity } from "@/hooks/useReports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Zap } from "lucide-react"

interface VelocityChartProps {
  projectId: string
}

export function VelocityChart({ projectId }: VelocityChartProps) {
  const { data: velocity, isLoading } = useVelocity(projectId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Sprint Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !velocity || velocity.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            No velocity data available. Complete some sprints first.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={velocity}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="sprint_name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip />
              <Legend />
              <Bar dataKey="committed_points" fill="#94a3b8" name="Committed" radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed_points" fill="#22c55e" name="Completed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
