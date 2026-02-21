/**
 * ============================================================
 * TYPES - TypeScript Interfaces & Types
 * ============================================================
 * WHY: TypeScript types enforce the shape of data at compile time.
 *      This prevents bugs like passing a number where a string is
 *      expected. The teacher's structure puts types in /types/.
 *
 * LESSON CONCEPT:
 *   - Props: "Props are set by the parent and they are fixed
 *     throughout the lifetime of a component."
 *   - We define prop shapes here so every component knows
 *     exactly what data it can receive.
 * ============================================================
 */

/** Gender options — used for the radio buttons */
export type Gender = "male" | "female";

/** Security question options — used in the select dropdown */
export type SecurityQuestion =
  | ""
  | "What is your pet's name?"
  | "What city were you born in?"
  | "What is your mother's maiden name?"
  | "What was the name of your first school?";

/**
 * The shape of the employee registration form data.
 * Every field in the form maps to a key here.
 */
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  securityQuestion: SecurityQuestion;
  securityAnswer: string;
  gender: Gender;
}

/**
 * Props for a single form input field (reusable InputField component).
 * Demonstrates "Props" concept from the lesson.
 */
export interface InputFieldProps {
  /** HTML input type (text, email, password, tel) */
  type: string;
  /** Placeholder text shown inside the input */
  placeholder: string;
  /** Current value — controlled component pattern */
  value: string;
  /** Change handler passed down from parent */
  onChange: (value: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Field name attribute */
  name: string;
}

/**
 * Props for the SelectField component.
 */
export interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  name: string;
  required?: boolean;
}

/**
 * Props for the RadioGroup component.
 */
export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

/**
 * Props for the Card component (Exercise from lesson).
 * "Create Stateless AND Stateful component for Card component
 *  that can receive title and description as props."
 */
export interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

/**
 * Props for CardImage component (Exercise from lesson).
 * "Create Stateless OR Stateful component for CardImage component
 *  that can receive imageUrl, title and description as props."
 */
export interface CardImageProps {
  imageUrl: string;
  title: string;
  description: string;
}
