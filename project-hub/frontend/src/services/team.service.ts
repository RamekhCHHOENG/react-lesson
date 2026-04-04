// ============================================================================
// Team / Members Service
// ============================================================================

import { api } from "@/services/api";
import type { ProjectMember, MemberRole } from "@/types";

export interface AddMemberData {
  user_id: string;
  role: MemberRole;
}

export const teamService = {
  /** List members of a project */
  getMembers(projectId: string): Promise<ProjectMember[]> {
    return api.get<ProjectMember[]>(`/api/projects/${projectId}/members`);
  },

  /** Add a member to a project */
  addMember(projectId: string, data: AddMemberData): Promise<ProjectMember> {
    return api.post<ProjectMember>(
      `/api/projects/${projectId}/members`,
      data,
    );
  },

  /** Update a member's role */
  updateRole(
    projectId: string,
    memberId: string,
    role: MemberRole,
  ): Promise<ProjectMember> {
    return api.put<ProjectMember>(
      `/api/projects/${projectId}/members/${memberId}`,
      { role },
    );
  },

  /** Remove a member from a project */
  removeMember(projectId: string, memberId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/members/${memberId}`);
  },
};
