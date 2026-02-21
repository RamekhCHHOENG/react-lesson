/**
 * WorkExperienceSection — Stateless Section Component
 * Renders: Years of experience (dropdown), Field/Sector (input)
 */
import React from "react";
import PropTypes from "prop-types";
import InputField from "./InputField";
import SelectField from "./SelectField";
import type { WorkExperienceSectionProps } from "../types";

const experienceOptions = [
  { value: "0-1", label: "0 - 1 Year" },
  { value: "1-3", label: "1 - 3 Years" },
  { value: "3-5", label: "3 - 5 Years" },
  { value: "5-10", label: "5 - 10 Years" },
  { value: "10+", label: "10+ Years" },
];

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  experienceYear,
  experienceField,
  onFieldChange,
}) => {
  return (
    <section className="reg__section">
      <h3 className="reg__section-title">Working Experiences</h3>

      <div className="reg__row">
        <div className="reg__col">
          <label className="reg__label">How many years of experiences</label>
          <SelectField
            name="workingExperienceYear"
            placeholder="0 - 1 Year"
            value={experienceYear}
            onChange={(v) => onFieldChange("workingExperienceYear", v)}
            options={experienceOptions}
            required={false}
          />
        </div>
        <div className="reg__col">
          <label className="reg__label">Field/Sector</label>
          <InputField
            type="text"
            name="workingExperienceField"
            placeholder="Field/Sector"
            value={experienceField}
            onChange={(v) => onFieldChange("workingExperienceField", v)}
            required={false}
          />
        </div>
      </div>
    </section>
  );
};

WorkExperienceSection.propTypes = {
  experienceYear: PropTypes.string.isRequired,
  experienceField: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default WorkExperienceSection;
