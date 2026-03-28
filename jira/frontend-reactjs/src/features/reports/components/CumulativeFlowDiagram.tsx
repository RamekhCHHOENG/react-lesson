import { useCumulativeFlow } from "@/hooks/useReports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Layers } from "lucide-react"

interface CumulativeFlowDiagramProps {
  projectId: string
}

export function CumulativeFlowDiagram({ projectId }: CumulativeFlowDiagramProps) {
  const { data: flowData, isLoading } = useCumulativeFlow(projectId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Cumulative Flow Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !flowData || flowData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            No flow data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="done" stackId="1" fill="#22c55e" stroke="#16a34a" name="Done" />
              <Area type="monotone" dataKey="review" stackId="1" fill="#eab308" stroke="#ca8a04" name="In Review" />
              <Area type="monotone" dataKey="in-progress" stackId="1" fill="#3b82f6" stroke="#2563eb" name="In Progress" />
              <Area type="monotone" dataKey="todo" stackId="1" fill="#94a3b8" stroke="#64748b" name="To Do" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
