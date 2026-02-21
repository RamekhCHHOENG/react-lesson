/**
 * ============================================================
 * Config — Environment variables and configuration
 * ============================================================
 * Teacher's structure: /config/ — "Environment variables and
 * configuration files"
 * ============================================================
 */

export const config = {
  appName: "Employee Registration",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
};
