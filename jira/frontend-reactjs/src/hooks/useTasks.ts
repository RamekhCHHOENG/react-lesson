import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Task, TaskFormData, TaskSummary, LinkedIssue, LinkType, TaskStatus, TaskPriority, Project } from "@/types"
import { toast } from "sonner"

export function useTasks(projectId: string | undefined) {
  return useQuery<Task[]>({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const project = await api.get<{ tasks: Task[] }>(`/api/projects/${projectId}`)
      return project.tasks
    },
    enabled: !!projectId,
  })
}

export function useAllTasks() {
  return useQuery<Task[]>({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const projects = await api.get<{ id: string; tasks: Task[] }[]>("/api/projects")
      return projects.flatMap((p) =>
        p.tasks.map((t) => ({ ...t, project_id: p.id }))
      )
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: TaskFormData }) =>
      api.post<Task>(`/api/projects/${projectId}/tasks`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Task created")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, data }: { projectId: string; taskId: string; data: Partial<TaskFormData> }) =>
      api.put<Task>(`/api/projects/${projectId}/tasks/${taskId}`, data),
    
    // OPTIMISTIC UPDATE
    onMutate: async ({ projectId, taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"])

      if (previousProjects) {
        queryClient.setQueryData<Project[]>(["projects"], (old) => {
          if (!old) return []
          return old.map((proj) => {
            if (proj.id !== projectId) return proj
            return {
              ...proj,
              tasks: proj.tasks.map((task) => 
                task.id === taskId ? { ...task, ...data } : task
              ),
            }
          })
        })
      }

      return { previousProjects }
    },

    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
    },
    
    onError: (err: Error, __, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects)
      }
      toast.error(err.message)
    },
    
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      api.delete(`/api/projects/${projectId}/tasks/${taskId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Task deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useSubtasks(projectId: string | undefined, taskId: string | undefined) {
  return useQuery<TaskSummary[]>({
    queryKey: ["subtasks", projectId, taskId],
    queryFn: () => api.get(`/api/projects/${projectId}/tasks/${taskId}/subtasks`),
    enabled: !!projectId && !!taskId,
  })
}

export function useCreateSubtask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, parentId, data }: { projectId: string; parentId: string; data: { title: string; assignee?: string } }) =>
      api.post<Task>(`/api/projects/${projectId}/tasks/${parentId}/subtasks`, data),
    onSuccess: (_, { projectId, parentId }) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", projectId, parentId] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Subtask created")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useLinkedIssues(projectId: string | undefined, taskId: string | undefined) {
  return useQuery<LinkedIssue[]>({
    queryKey: ["linked-issues", projectId, taskId],
    queryFn: () => api.get(`/api/projects/${projectId}/tasks/${taskId}/links`),
    enabled: !!projectId && !!taskId,
  })
}

export function useLinkIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, targetTaskId, linkType }: { projectId: string; taskId: string; targetTaskId: string; linkType: LinkType }) =>
      api.post<LinkedIssue>(`/api/projects/${projectId}/tasks/${taskId}/links`, {
        target_task_id: targetTaskId,
        link_type: linkType,
      }),
    onSuccess: (_, { projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["linked-issues", projectId, taskId] })
      toast.success("Issue linked")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUnlinkIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskId, linkId }: { projectId: string; taskId: string; linkId: string }) =>
      api.delete(`/api/projects/${projectId}/tasks/${taskId}/links/${linkId}`),
    onSuccess: (_, { projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["linked-issues", projectId, taskId] })
      toast.success("Issue unlinked")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskIds, data }: { projectId: string; taskIds: string[]; data: { status?: TaskStatus; priority?: TaskPriority } }) =>
      api.post(`/api/projects/${projectId}/tasks/bulk-update`, { task_ids: taskIds, ...data }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Tasks updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, taskIds }: { projectId: string; taskIds: string[] }) =>
      api.post(`/api/projects/${projectId}/tasks/bulk-delete`, { task_ids: taskIds }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Tasks deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
