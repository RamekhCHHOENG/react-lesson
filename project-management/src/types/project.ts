export type ProjectStatus = "planning" | "in-progress" | "on-hold" | "completed" | "cancelled"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "todo" | "in-progress" | "review" | "done"

export interface Task {
 id: string
 title: string
 description: string
 status: TaskStatus
 assignee: string
 dueDate: string
 createdAt: string
 updatedAt: string
}

export interface Project {
 id: string
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
 name: string
 description: string
 status: ProjectStatus
 priority: ProjectPriority
 startDate: string
 endDate: string
 tags: string[]
}

export interface TaskFormData {
 title: string
 description: string
 status: TaskStatus
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
