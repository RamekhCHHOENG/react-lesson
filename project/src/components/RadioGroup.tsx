/**
 * ============================================================
 * RadioGroup — STATELESS (Functional) Component
 * ============================================================
 * LESSON CONCEPT APPLIED:
 *   ✅ Stateless Component: Pure presentational, no state.
 *   ✅ Props: name, value, onChange, options
 *   ✅ PropTypes: Runtime validation
 *
 * WHY Stateless?
 *   The selected gender value is managed by the parent form's
 *   state. This component is only responsible for rendering
 *   the radio buttons and reporting the user's choice.
 * ============================================================
 */

import PropTypes from "prop-types";
import type { RadioGroupProps } from "../types";
import "../styles/RadioGroup.css";

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="radio-group">
      {options.map((opt: { value: string; label: string }) => (
        <label key={opt.value} className="radio-group__label">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="radio-group__input"
          />
          <span className="radio-group__text">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
};

export default RadioGroup;
