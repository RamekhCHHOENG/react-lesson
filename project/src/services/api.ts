/**
 * ============================================================
 * API Service — /services/
 * ============================================================
 * Teacher's structure: /services/ — "API requests, utilities,
 * external service integrations"
 *
 * WHY?
 *   Separating API logic from components keeps components
 *   focused on UI. When the backend is ready, you only
 *   change this file — not every component.
 *
 * For now this is a mock that simulates an API call.
 * ============================================================
 */

import type { EmployeeFormData } from "../types";

// @ts-ignore placeholder for future API integration
const _API_BASE = "/api";

/**
 * Simulate registering an employee (mock — no real backend).
 */
export async function registerEmployee(
  data: EmployeeFormData
): Promise<{ success: boolean; message: string }> {

  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Employee ${data.firstName} ${data.lastName} registered successfully!`,
      });
    }, 800);
  });
}
