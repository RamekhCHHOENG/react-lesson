import { useState, useEffect, useCallback } from "react";

/* ── Reusable Layout Components ── */
import FormSection from "../components/FormSection";
import FormRow from "../components/FormRow";
import FormField from "../components/FormField";

/* ── Reusable Input Components ── */
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import CheckboxField from "../components/CheckboxField";
import DateField from "../components/DateField";
import TextAreaField from "../components/TextAreaField";
import FileField from "../components/FileField";

/* ── Reusable List-Item Component ── */
import SubjectRow from "../components/SubjectRow";

/* ── Types ── */
import type { RegisterFormData, SubjectEntry } from "../types";

/* ── Styles ── */
import "../styles/NewRegister.css";

/* ═══════════════════════════════════════
 * OPTIONS — configured once, reused
 * ═══════════════════════════════════════ */
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0 - 1 Year" },
  { value: "1-3", label: "1 - 3 Years" },
  { value: "3-5", label: "3 - 5 Years" },
  { value: "5-10", label: "5 - 10 Years" },
  { value: "10+", label: "10+ Years" },
];

/** Default form data — used for init and reset */
const INITIAL_FORM_DATA: RegisterFormData = {
  subjects: [{ id: 1, subject: "", schoolName: "", year: "" }],
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  isDisabled: false,
  disability: "",
  workingExperienceYear: "",
  workingExperienceField: "",
  interest: "",
  cvUrl: "",
};

/* ═══════════════════════════════════════
 * FUNCTIONAL COMPONENT — Manages State via Hooks
 * ═══════════════════════════════════════ */
const NewRegister: React.FC = () => {
  /* ── useState — replaces this.state ── */
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegisterFormData | null>(null);
  const [_nextSubjectId, setNextSubjectId] = useState(2);

  /* ── useEffect — replaces componentDidMount + componentWillUnmount ── */
  useEffect(() => {
    // Runs once after first render (like componentDidMount)
    document.title = "Signup for Free";

    // Cleanup function (like componentWillUnmount)
    return () => {
      document.title = "React App";
    };
  }, []); // empty deps → mount once, cleanup on unmount

  /* ═══════════════════════════════════════
   * STATE MANAGEMENT — useCallback for stable references
   * ═══════════════════════════════════════ */

  /** Generic field change */
  const handleFieldChange = useCallback(
    (field: keyof RegisterFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /** Education subject row change */
  const handleSubjectChange = useCallback(
    (id: number, field: keyof SubjectEntry, value: string) => {
      setFormData((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === id ? { ...s, [field]: value } : s
        ),
      }));
    },
    []
  );

  /** Add education row */
  const handleAddSubject = useCallback(() => {
    setNextSubjectId((prev) => {
      setFormData((fd) => ({
        ...fd,
        subjects: [
          ...fd.subjects,
          { id: prev, subject: "", schoolName: "", year: "" },
        ],
      }));
      return prev + 1;
    });
  }, []);

  /** Remove education row */
  const handleRemoveSubject = useCallback((id: number) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  }, []);

  /** File upload */
  const handleFileChange = useCallback((file: File | null) => {
    setFormData((prev) => ({ ...prev, cvUrl: file ? file.name : "" }));
  }, []);

  /** Submit */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      setSubmittedData({ ...formData });
    },
    [formData]
  );

  /** Reset */
  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setSubmitted(false);
    setSubmittedData(null);
    setNextSubjectId(2);
  }, []);

  /* ═══════════════════════════════════════
   * JSX — Compose all reusable components
   * ═══════════════════════════════════════ */
  return (
    <div className="nreg">
      <div className="nreg__card">
        {/* ── Title ── */}
        <h2 className="nreg__title">Signup for free</h2>

        {/* ══════════════════════════════════════
         *  SUCCESS — conditional rendering
         * ══════════════════════════════════════ */}
        {submitted && submittedData ? (
          <div className="nreg__success">
            <div className="nreg__success-icon">✅</div>
            <h3>Registration Complete!</h3>
            <p className="nreg__success-name">
              {submittedData.firstName} {submittedData.lastName}
            </p>
            <button
              type="button"
              className="nreg__btn nreg__btn--outline"
              onClick={handleReset}
            >
              Register Another
            </button>
          </div>
        ) : (
          /* ══════════════════════════════════════
           *  FORM — composed from reusable components
           * ══════════════════════════════════════ */
          <form onSubmit={handleSubmit} className="nreg__form">

            {/* ── Section 1: Personal Information ── */}
            <FormSection title="Personal Information">

              {/* Row: First Name + Last Name (2 columns) */}
              <FormRow cols={2}>
                <FormField label="First Name">
                  <InputField
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(v) => handleFieldChange("firstName", v)}
                  />
                </FormField>
                <FormField label="Last Name">
                  <InputField
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(v) => handleFieldChange("lastName", v)}
                  />
                </FormField>
              </FormRow>

              {/* Row: Gender + Date of Birth */}
              <FormRow cols={2}>
                <FormField label="Gender">
                  <SelectField
                    name="gender"
                    placeholder="Choose..."
                    value={formData.gender}
                    onChange={(v) => handleFieldChange("gender", v)}
                    options={GENDER_OPTIONS}
                  />
                </FormField>
                <FormField label="Date of Birth">
                  <DateField
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(v) => handleFieldChange("dateOfBirth", v)}
                  />
                </FormField>
              </FormRow>

              {/* Row: Phone + Email */}
              <FormRow cols={2}>
                <FormField label="Phone">
                  <InputField
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(v) => handleFieldChange("phone", v)}
                  />
                </FormField>
                <FormField label="Email">
                  <InputField
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(v) => handleFieldChange("email", v)}
                  />
                </FormField>
              </FormRow>

              {/* Row: Address (full width) */}
              <FormRow cols={1}>
                <FormField label="Address">
                  <InputField
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(v) => handleFieldChange("address", v)}
                  />
                </FormField>
              </FormRow>

              {/* Checkbox: Disability */}
              <div className="nreg__checkbox-row">
                <CheckboxField
                  name="isDisabled"
                  label="Disability"
                  checked={formData.isDisabled}
                  onChange={(v) => handleFieldChange("isDisabled", v)}
                />
              </div>
              {/* Purple bar (matches screenshot) */}
              <div className="nreg__purple-bar" />
              {/* Conditional: disability input */}
              {formData.isDisabled && (
                <div className="nreg__disability-field">
                  <InputField
                    type="text"
                    name="disability"
                    placeholder="Please specify disability"
                    value={formData.disability}
                    onChange={(v) => handleFieldChange("disability", v)}
                    required={false}
                  />
                </div>
              )}
            </FormSection>

            {/* ── Section 2: Education Information ── */}
            <FormSection title="Education Information">
              {/* Dynamic list: SubjectRow reused for each entry */}
              {formData.subjects.map((entry: SubjectEntry) => (
                <SubjectRow
                  key={entry.id}
                  entry={entry}
                  onChange={handleSubjectChange}
                  onRemove={handleRemoveSubject}
                  canRemove={formData.subjects.length > 1}
                />
              ))}

              <button
                type="button"
                className="nreg__add-btn"
                onClick={handleAddSubject}
              >
                + Add Education
              </button>
            </FormSection>

            {/* ── Section 3: Working Experiences ── */}
            <FormSection title="Working Experiences">
              <FormRow cols={2}>
                <FormField label="How many years of experiences">
                  <SelectField
                    name="workingExperienceYear"
                    placeholder="0 - 1 Year"
                    value={formData.workingExperienceYear}
                    onChange={(v) => handleFieldChange("workingExperienceYear", v)}
                    options={EXPERIENCE_OPTIONS}
                    required={false}
                  />
                </FormField>
                <FormField label="Field/Sector">
                  <InputField
                    type="text"
                    name="workingExperienceField"
                    placeholder="Field/Sector"
                    value={formData.workingExperienceField}
                    onChange={(v) => handleFieldChange("workingExperienceField", v)}
                    required={false}
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* ── Section 4: Other Information ── */}
            <FormSection title="Other Information">
              <FormRow cols={1}>
                <FormField label="Interests">
                  <TextAreaField
                    name="interest"
                    placeholder="Interests"
                    value={formData.interest}
                    onChange={(v) => handleFieldChange("interest", v)}
                    required={false}
                    rows={3}
                  />
                </FormField>
              </FormRow>

              <FileField
                onFileChange={handleFileChange}
                fileName={formData.cvUrl}
              />
            </FormSection>

            {/* ── Submit Button ── */}
            <div className="nreg__actions">
              <button type="submit" className="nreg__btn nreg__btn--primary">
                Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewRegister;
