/**
 * ============================================================
 * InputField — STATELESS (Functional) Component
 * ============================================================
 * LESSON CONCEPT APPLIED:
 *   ✅ Stateless Component (Functional Component):
 *      "Stateless components obviously have no state."
 *      This component only receives props and renders UI.
 *
 *   ✅ Props:
 *      "Props are set by the parent and they are fixed throughout
 *       the lifetime of a component."
 *      - type, placeholder, value, onChange, required, name
 *        are all passed from the parent (RegistrationForm).
 *
 *   ✅ PropTypes (Typechecking With PropTypes):
 *      "PropTypes exports a range of validators that can be used
 *       to make sure the data you receive is valid."
 *      We use PropTypes for runtime validation alongside TS types.
 *
 *   ✅ Default Props:
 *      "You can define default values for your props by assigning
 *       to the special defaultProps property."
 *
 * WHY Stateless?
 *   An input field doesn't own any data — its value lives in the
 *   parent's state. It just *displays* and *reports changes*.
 *   This makes it a perfect Stateless / Functional component.
 * ============================================================
 */

import PropTypes from "prop-types";
import type { InputFieldProps } from "../types";
import "../styles/InputField.css";

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  required = true,
  name,
}) => {
  return (
    <div className="input-field">
      <input
        type={type}
        name={name}
        placeholder={`${placeholder}${required ? " *" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="input-field__input"
      />
    </div>
  );
};

/**
 * Runtime prop validation (PropTypes).
 * Even though we have TypeScript, PropTypes gives us runtime
 * warnings in the browser console during development.
 * Lesson: "propTypes is only checked in development mode."
 */
InputField.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
};

/**
 * Default Props — Lesson: "You can define default values for
 * your props by assigning to the special defaultProps property."
 * In modern React + TS, we set defaults via destructuring defaults
 * above: `required = true`. This achieves the same thing.
 */

export default InputField;
