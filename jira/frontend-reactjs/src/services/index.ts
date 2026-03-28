// ============================================================================
// Services – barrel export
// ============================================================================

export { api, ApiRequestError } from "@/services/api";
export { authService } from "@/services/auth.service";
export { projectService } from "@/services/project.service";
export { taskService } from "@/services/task.service";
export { sprintService } from "@/services/sprint.service";
export { commentService } from "@/services/comment.service";
export { teamService } from "@/services/team.service";
export { notificationService } from "@/services/notification.service";
export { searchService } from "@/services/search.service";
export { activityService } from "@/services/activity.service";
export { epicService } from "@/services/epic.service";
export { labelService } from "@/services/label.service";

// Re-export service-specific types
export type { CreateCommentData, UpdateCommentData } from "@/services/comment.service";
export type { AddMemberData } from "@/services/team.service";
export type { UnreadCountResponse } from "@/services/notification.service";
