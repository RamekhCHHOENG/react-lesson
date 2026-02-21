/**
 * ============================================================
 * SelectField — STATELESS (Functional) Component
 * ============================================================
 * LESSON CONCEPT APPLIED:
 *   ✅ Stateless Component: No internal state, only props.
 *   ✅ Props: value, onChange, options, placeholder, name
 *   ✅ PropTypes: Runtime validation for development mode.
 *   ✅ Default Props
 *
 * WHY Stateless?
 *   The selected value is owned by the parent form's state.
 *   This component just renders the <select> and fires onChange.
 * ============================================================
 */

import PropTypes from "prop-types";
import type { SelectFieldProps } from "../types";
import "../styles/SelectField.css";

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder,
  name,
  required = true,
}) => {
  return (
    <div className="select-field">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="select-field__select"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

SelectField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  placeholder: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

/**
 * Default Props: We set `required = true` as a default parameter
 * in the function signature above (modern approach).
 */

export default SelectField;
