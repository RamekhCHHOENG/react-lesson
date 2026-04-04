// ============================================================================
// Label Service
// ============================================================================

import { api } from "@/services/api";
import type { Label, LabelFormData } from "@/types";

export const labelService = {
  getAll(): Promise<Label[]> {
    return api.get<Label[]>("/api/labels");
  },

  create(data: LabelFormData): Promise<Label> {
    return api.post<Label>("/api/labels", data);
  },

  update(labelId: string, data: Partial<LabelFormData>): Promise<Label> {
    return api.put<Label>(`/api/labels/${labelId}`, data);
  },

  delete(labelId: string): Promise<void> {
    return api.delete(`/api/labels/${labelId}`);
  },
};
