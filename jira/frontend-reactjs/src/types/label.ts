// ============================================================================
// Label Types
// ============================================================================

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface LabelFormData {
  name: string;
  color: string;
  description?: string;
}

export const LABEL_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#78716c",
] as const;
