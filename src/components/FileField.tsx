/**
 * FileField — Stateless Functional Component
 * Props: onFileChange, fileName, accept
 */
import PropTypes from "prop-types";
import type { FileFieldProps } from "../types";

const FileField: React.FC<FileFieldProps> = ({
  onFileChange,
  fileName,
  accept = ".pdf,.doc,.docx,.jpg,.png",
}) => {
  return (
    <div className="file-field">
      <label className="file-field__btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        Pick file
        <input
          type="file"
          accept={accept}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="file-field__hidden"
        />
      </label>
      {fileName && <span className="file-field__name">{fileName}</span>}
    </div>
  );
};

FileField.propTypes = {
  onFileChange: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  accept: PropTypes.string,
};

export default FileField;
