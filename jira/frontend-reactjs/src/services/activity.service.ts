// ============================================================================
// Activity Service
// ============================================================================

import { api } from "@/services/api";
import type { Activity } from "@/types";

export const activityService = {
  /** Fetch activity log for a given entity */
  getByEntity(entityType: string, entityId: string): Promise<Activity[]> {
    const params = new URLSearchParams({
      entity_type: entityType,
      entity_id: entityId,
    });
    return api.get<Activity[]>(`/api/activity?${params.toString()}`);
  },
};
