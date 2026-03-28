// ============================================================================
// Sprint Types
// ============================================================================

import type { Task } from "./task";

// ── Enums / Union types ─────────────────────────────────────────────────────

export type SprintStatus = "planning" | "active" | "completed";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

/** Compact sprint reference for task detail or pickers */
export interface SprintSummary {
  id: string;
  name: string;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface SprintFormData {
  name: string;
  goal: string;
  start_date?: string;
  end_date?: string;
}

export type CreateSprintRequest = SprintFormData;

export interface UpdateSprintRequest extends Partial<SprintFormData> {
  status?: SprintStatus;
}

/** Payload for starting or completing a sprint */
export interface SprintTransitionRequest {
  status: "active" | "completed";
  /** When completing, optionally move unfinished tasks to another sprint */
  move_unfinished_to?: string;
}
