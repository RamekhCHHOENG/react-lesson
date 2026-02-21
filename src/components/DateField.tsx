/**
 * DateField — Stateless Functional Component
 * Props: value, onChange, name, placeholder, required
 */
import PropTypes from "prop-types";
import type { DateFieldProps } from "../types";

const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
  name,
  placeholder = "mm/dd/yyyy",
  required = false,
}) => {
  return (
    <div className="date-field">
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="date-field__input"
      />
    </div>
  );
};

DateField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export default DateField;
