/**
 * EducationSection — Stateless Section Component
 * Renders dynamic education rows (Subject, School Name, Year)
 * Parent owns subjects[] state — this component only renders & reports changes
 * Demonstrates: Props, PropTypes, .map() rendering, dynamic list
 */
import React from "react";
import PropTypes from "prop-types";
import InputField from "./InputField";
import SelectField from "./SelectField";
import type { EducationSectionProps, SubjectEntry } from "../types";

const yearOptions = (() => {
  const years = [];
  for (let y = 2025; y >= 2000; y--) {
    years.push({ value: `${y}`, label: `${y}` });
  }
  return years;
})();

const EducationSection: React.FC<EducationSectionProps> = ({
  subjects,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
}) => {
  return (
    <section className="reg__section">
      <h3 className="reg__section-title">Education Information</h3>

      {subjects.map((entry: SubjectEntry) => (
        <div key={entry.id} className="reg__edu-row">
          <div className="reg__edu-grid">
            <div className="reg__col">
              <label className="reg__label">Subject</label>
              <InputField
                type="text"
                name={`subject-${entry.id}`}
                placeholder="Subject"
                value={entry.subject}
                onChange={(v) => onSubjectChange(entry.id, "subject", v)}
                required={false}
              />
            </div>
            <div className="reg__col">
              <label className="reg__label">School Name</label>
              <InputField
                type="text"
                name={`schoolName-${entry.id}`}
                placeholder="School Name"
                value={entry.schoolName}
                onChange={(v) => onSubjectChange(entry.id, "schoolName", v)}
                required={false}
              />
            </div>
            <div className="reg__col reg__col--sm">
              <label className="reg__label">Year</label>
              <SelectField
                name={`year-${entry.id}`}
                placeholder="2015 -"
                value={entry.year}
                onChange={(v) => onSubjectChange(entry.id, "year", v)}
                options={yearOptions}
                required={false}
              />
            </div>
            {subjects.length > 1 && (
              <button
                type="button"
                className="reg__remove-btn"
                onClick={() => onRemoveSubject(entry.id)}
                title="Remove row"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="reg__add-btn"
        onClick={onAddSubject}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Education
      </button>
    </section>
  );
};

EducationSection.propTypes = {
  subjects: PropTypes.array.isRequired,
  onSubjectChange: PropTypes.func.isRequired,
  onAddSubject: PropTypes.func.isRequired,
  onRemoveSubject: PropTypes.func.isRequired,
};

export default EducationSection;
