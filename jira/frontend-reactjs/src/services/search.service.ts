// ============================================================================
// Search Service
// ============================================================================

import { api } from "@/services/api";
import type { SearchResult } from "@/types";

export const searchService = {
  /** Global search across projects and tasks */
  search(query: string): Promise<SearchResult[]> {
    const encoded = encodeURIComponent(query);
    return api.get<SearchResult[]>(`/api/search?q=${encoded}`);
  },
};
