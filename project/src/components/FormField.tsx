/**
 * ============================================================
 * FormField — REUSABLE Wrapper Component (Stateless)
 * ============================================================
 * LESSON: Build, Style, Configure & Reuse Components
 *
 *   ✅ Configure via props: label, size
 *   ✅ Reuse: Wraps EVERY input field in the form
 *   ✅ children (Composition): accepts any input component
 *      (InputField, SelectField, DateField, etc.)
 *   ✅ PropTypes: runtime validation
 *
 * This is the most reused component in the entire form.
 * It provides a consistent label + input layout for every field.
 *
 * Usage:
 *   <FormField label="First Name">
 *     <InputField ... />
 *   </FormField>
 * ============================================================
 */
import React from "react";
import PropTypes from "prop-types";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  /** Column size inside a FormRow: "full" | "sm" | default (equal) */
  size?: "default" | "full" | "sm";
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  size = "default",
}) => {
  const sizeClass = size !== "default" ? ` form-field--${size}` : "";

  return (
    <div className={`form-field${sizeClass}`}>
      <label className="form-field__label">{label}</label>
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["default", "full", "sm"] as const),
};

export default FormField;
