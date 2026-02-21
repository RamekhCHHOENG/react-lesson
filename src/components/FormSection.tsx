/**
 * ============================================================
 * FormSection — REUSABLE Layout Component (Stateless)
 * ============================================================
 * LESSON: Build, Style, Configure & Reuse Components
 *
 *   ✅ Configure via props: title (string)
 *   ✅ Reuse: Used 4 times in Register page with different titles
 *   ✅ children (Composition): wraps any content inside a section
 *   ✅ PropTypes: runtime validation
 *
 * This component does NOT own any state.
 * It only receives props and renders a styled section wrapper.
 * ============================================================
 */
import React from "react";
import PropTypes from "prop-types";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <section className="form-section">
      <h3 className="form-section__title">{title}</h3>
      <div className="form-section__body">{children}</div>
    </section>
  );
};

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FormSection;
