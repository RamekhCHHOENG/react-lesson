import { useState } from "react"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import type { TaskStatus, TaskPriority, IssueType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Settings2,
  Palette,
  Tag,
  Layout,
  ListChecks,
  CheckSquare,
  AlertCircle,
  BookOpen,
  Zap,
  GitBranch,
  Bug,
} from "lucide-react"
import { LabelsManager } from "@/features/settings/components/LabelsManager"

const issueTypeIcons: Record<string, React.ReactNode> = {
  epic: <Zap className="h-4 w-4" />,
  story: <BookOpen className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  bug: <Bug className="h-4 w-4" />,
  subtask: <GitBranch className="h-4 w-4" />,
}

export default function CustomizePage() {
  const [tab, setTab] = useState("workflow")

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-500/10">
          <Settings2 className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customize</h1>
          <p className="text-sm text-muted-foreground">
            Configure your workspace workflow and display settings
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="workflow" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="issue-types" className="gap-1.5">
            <Layout className="h-3.5 w-3.5" />
            Issue Types
          </TabsTrigger>
          <TabsTrigger value="labels" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Labels
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Display
          </TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Statuses</CardTitle>
              <CardDescription>The workflow statuses used for tasks on the board</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.entries(TASK_STATUS_CONFIG) as [TaskStatus, typeof TASK_STATUS_CONFIG[TaskStatus]][]).map(
                  ([key, config]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border border-border/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: config.hex }}
                        />
                        <span className="text-sm font-medium">{config.label}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {key}
                        </Badge>
                      </div>
                      <Badge
                        className="text-[10px]"
                        style={{
                          backgroundColor: config.hex + "20",
                          color: config.hex,
                        }}
                      >
                        Active
                      </Badge>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                Board columns map directly to these statuses. Drag tasks between columns to change status.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Levels</CardTitle>
              <CardDescription>Task priority configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.entries(TASK_PRIORITY_CONFIG) as [TaskPriority, typeof TASK_PRIORITY_CONFIG[TaskPriority]][]).map(
                  ([key, config]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border border-border/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: config.hex }}
                        />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {key}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issue Types Tab */}
        <TabsContent value="issue-types" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Issue Types</CardTitle>
              <CardDescription>Types of work items used in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.entries(ISSUE_TYPE_CONFIG) as [IssueType, typeof ISSUE_TYPE_CONFIG[IssueType]][]).map(
                  ([key, config]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border border-border/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md"
                          style={{ backgroundColor: config.hex + "20", color: config.hex }}
                        >
                          {issueTypeIcons[key]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{config.label}</span>
                          <p className="text-xs text-muted-foreground">
                            {key === "epic" && "Large body of work spanning multiple sprints"}
                            {key === "story" && "User-facing feature or requirement"}
                            {key === "task" && "General work item or action"}
                            {key === "bug" && "Something that needs to be fixed"}
                            {key === "subtask" && "Breakdown of a parent task"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ color: config.hex, borderColor: config.hex + "40" }}
                      >
                        Enabled
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="mt-4">
          <LabelsManager />
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board Settings</CardTitle>
              <CardDescription>Configure how the board displays tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show subtask count</p>
                  <p className="text-xs text-muted-foreground">Display subtask progress on cards</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show assignee avatars</p>
                  <p className="text-xs text-muted-foreground">Display assignee on task cards</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show priority icons</p>
                  <p className="text-xs text-muted-foreground">Display priority indicator on task cards</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show issue key</p>
                  <p className="text-xs text-muted-foreground">Display key (e.g., PROJ-123) on cards</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Compact mode</p>
                  <p className="text-xs text-muted-foreground">Reduce card height for denser view</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sidebar</CardTitle>
              <CardDescription>Configure navigation sidebar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Auto-collapse sidebar</p>
                  <p className="text-xs text-muted-foreground">Collapse sidebar on smaller screens</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Show item counts</p>
                  <p className="text-xs text-muted-foreground">Display task counts in sidebar items</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
