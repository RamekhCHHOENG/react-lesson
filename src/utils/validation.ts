/**
 * ============================================================
 * UTILS - Utility / Helper Functions
 * ============================================================
 * WHY: The teacher's structure puts reusable helpers in /utils/.
 *      These are pure functions with no side-effects — easy to
 *      test and reuse across the whole app.
 *
 * LESSON CONCEPT:
 *   - "Components are like JavaScript functions" — and so are
 *     utilities. Keeping logic out of components keeps them clean.
 * ============================================================
 */

/**
 * Basic email validation using a regex pattern.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Basic phone validation (accepts digits, spaces, dashes, parentheses, +).
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if password and confirmPassword match.
 */
export function doPasswordsMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword;
}

/**
 * Validate that all required fields are filled.
 */
export function isFormComplete(fields: Record<string, string>): boolean {
  return Object.values(fields).every((v) => v.trim().length > 0);
}
