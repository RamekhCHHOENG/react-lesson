/**
 * TextAreaField — Stateless Functional Component
 * Props: value, onChange, name, placeholder, required, rows
 */
import PropTypes from "prop-types";
import type { TextAreaFieldProps } from "../types";

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  value,
  onChange,
  name,
  placeholder = "",
  required = false,
  rows = 3,
}) => {
  return (
    <div className="textarea-field">
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="textarea-field__input"
      />
    </div>
  );
};

TextAreaField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
};

export default TextAreaField;
