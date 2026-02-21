/**
 * ============================================================
 * SubjectRow — REUSABLE List-Item Component (Stateless)
 * ============================================================
 * LESSON: Build, Style, Configure & Reuse Components
 *
 *   ✅ Configure via props: entry data, onChange, onRemove, canRemove
 *   ✅ Reuse: Rendered once per education entry via .map()
 *   ✅ Demonstrates dynamic list rendering
 *   ✅ Composes FormField + InputField + SelectField inside
 *   ✅ PropTypes: runtime validation
 *
 * Each SubjectRow is a self-contained row of 3 fields.
 * The parent owns the data — this component just displays & reports.
 * ============================================================
 */
import React from "react";
import PropTypes from "prop-types";
import FormField from "./FormField";
import InputField from "./InputField";
import SelectField from "./SelectField";
import type { SubjectEntry } from "../types";

interface SubjectRowProps {
  entry: SubjectEntry;
  onChange: (id: number, field: keyof SubjectEntry, value: string) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

const yearOptions = (() => {
  const years = [];
  for (let y = 2025; y >= 2000; y--) {
    years.push({ value: `${y}`, label: `${y}` });
  }
  return years;
})();

const SubjectRow: React.FC<SubjectRowProps> = ({
  entry,
  onChange,
  onRemove,
  canRemove,
}) => {
  return (
    <div className="subject-row">
      <div className="subject-row__grid">
        <FormField label="Subject">
          <InputField
            type="text"
            name={`subject-${entry.id}`}
            placeholder="Subject"
            value={entry.subject}
            onChange={(v) => onChange(entry.id, "subject", v)}
            required={false}
          />
        </FormField>

        <FormField label="School Name">
          <InputField
            type="text"
            name={`school-${entry.id}`}
            placeholder="School Name"
            value={entry.schoolName}
            onChange={(v) => onChange(entry.id, "schoolName", v)}
            required={false}
          />
        </FormField>

        <FormField label="Year" size="sm">
          <SelectField
            name={`year-${entry.id}`}
            placeholder="2015 -"
            value={entry.year}
            onChange={(v) => onChange(entry.id, "year", v)}
            options={yearOptions}
            required={false}
          />
        </FormField>

        {canRemove && (
          <button
            type="button"
            className="subject-row__remove"
            onClick={() => onRemove(entry.id)}
            title="Remove"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

SubjectRow.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    schoolName: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
};

export default SubjectRow;
