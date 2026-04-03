export type ProjectStatus = "planning" | "in-progress" | "on-hold" | "completed" | "cancelled"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"
export type IssueType = "story" | "task" | "bug" | "epic"
export type IssuePriority = ProjectPriority
export type TaskStatus = "todo" | "in-progress" | "review" | "done" | (string & Record<never, never>)

export interface Task {
 id: string
 issueKey: string
 issueType: IssueType
 title: string
 description: string
 status: TaskStatus
 priority: IssuePriority
 reporter: string
 assignee: string
 dueDate: string
 createdAt: string
 updatedAt: string
}

export interface Project {
 id: string
 key: string
 name: string
 description: string
 status: ProjectStatus
 priority: ProjectPriority
 startDate: string
 endDate: string
 tasks: Task[]
 tags: string[]
 createdAt: string
 updatedAt: string
}

export interface ProjectFormData {
 key: string
 name: string
 description: string
 status: ProjectStatus
 priority: ProjectPriority
 startDate: string
 endDate: string
 tags: string[]
}

export interface TaskFormData {
 issueType: IssueType
 title: string
 description: string
 status: TaskStatus
 priority: IssuePriority
 reporter: string
 assignee: string
 dueDate: string
}

export interface ProjectStats {
 total: number
 planning: number
 inProgress: number
 onHold: number
 completed: number
 cancelled: number
}
