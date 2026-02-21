/**
 * OtherInfoSection — Stateless Section Component
 * Renders: Interests (textarea), File upload (CV)
 */
import React from "react";
import PropTypes from "prop-types";
import TextAreaField from "./TextAreaField";
import FileField from "./FileField";
import type { OtherInfoSectionProps } from "../types";

const OtherInfoSection: React.FC<OtherInfoSectionProps> = ({
  interest,
  cvUrl,
  onFieldChange,
  onFileChange,
}) => {
  const fileName = cvUrl ? cvUrl.split(/[\\/]/).pop() || cvUrl : "";

  return (
    <section className="reg__section">
      <h3 className="reg__section-title">Other Information</h3>

      <div className="reg__row">
        <div className="reg__col reg__col--full">
          <label className="reg__label">Interests</label>
          <TextAreaField
            name="interest"
            placeholder="Interests"
            value={interest}
            onChange={(v) => onFieldChange("interest", v)}
            required={false}
            rows={3}
          />
        </div>
      </div>

      <div className="reg__row">
        <div className="reg__col reg__col--full">
          <FileField
            onFileChange={onFileChange}
            fileName={fileName}
          />
        </div>
      </div>
    </section>
  );
};

OtherInfoSection.propTypes = {
  interest: PropTypes.string.isRequired,
  cvUrl: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
};

export default OtherInfoSection;
