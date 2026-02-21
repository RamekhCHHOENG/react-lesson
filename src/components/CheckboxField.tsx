/**
 * CheckboxField — Stateless Functional Component
 * Props: label, checked, onChange, name
 */
import PropTypes from "prop-types";
import type { CheckboxFieldProps } from "../types";

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
  name,
}) => {
  return (
    <label className="checkbox-field">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox-field__input"
      />
      <span className="checkbox-field__checkmark" />
      <span className="checkbox-field__label">{label}</span>
    </label>
  );
};

CheckboxField.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

export default CheckboxField;
