/**
 * ============================================================
 * FormRow — REUSABLE Layout Component (Stateless)
 * ============================================================
 * LESSON: Build, Style, Configure & Reuse Components
 *
 *   ✅ Configure via props: cols (number of columns)
 *   ✅ Reuse: Used many times to create 1-col or 2-col layouts
 *   ✅ children (Composition): wraps any form fields
 *
 * Example:
 *   <FormRow cols={2}> → two equal columns side by side
 *   <FormRow cols={1}> → single full-width column
 * ============================================================
 */
import React from "react";
import PropTypes from "prop-types";

interface FormRowProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}

const FormRow: React.FC<FormRowProps> = ({ children, cols = 2 }) => {
  return (
    <div className={`form-row form-row--${cols}`}>
      {children}
    </div>
  );
};

FormRow.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.oneOf([1, 2, 3] as const),
};

export default FormRow;
