// ============================================================================
// Epic Types
// ============================================================================

// ── Enums / Union types ─────────────────────────────────────────────────────

export type EpicStatus = "todo" | "in-progress" | "done";

export const EPIC_COLORS = [
  "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#db2777", "#4f46e5", "#0d9488", "#ca8a04",
] as const;

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Epic {
  id: string;
  project_id: string;
  name: string;
  description: string;
  color: string;
  status: EpicStatus;
  start_date: string | null;
  target_date: string | null;
  task_ids: string[];
  tasks_total: number;
  tasks_done: number;
  created_at: string;
  updated_at: string;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface EpicFormData {
  name: string;
  description?: string;
  color: string;
  status: EpicStatus;
  start_date?: string;
  target_date?: string;
}

export type CreateEpicRequest = EpicFormData;
export type UpdateEpicRequest = Partial<EpicFormData>;
