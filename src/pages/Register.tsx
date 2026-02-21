/**
 * ============================================================
 * Register Page — Class Component (Stateful)
 * ============================================================
 * Matches the exercise "Signup for free" screenshot.
 *
 * LESSON CONCEPTS APPLIED:
 *   ✅ Stateful Component (Class Component)
 *   ✅ State & setState with callback form
 *   ✅ Lifecycle: constructor, componentDidMount, shouldComponentUpdate,
 *      componentDidUpdate, componentWillUnmount
 *   ✅ Props: parent → child (controlled component pattern)
 *   ✅ Component composition: each section is its own component
 *   ✅ Dynamic list rendering (education subjects)
 *   ✅ Conditional rendering (disability field)
 *
 * The form is broken into 4 section components:
 *   - PersonalInfoSection  (stateless)
 *   - EducationSection     (stateless)
 *   - WorkExperienceSection(stateless)
 *   - OtherInfoSection     (stateless)
 *
 * This page OWNS all state and passes data + callbacks via props.
 * ============================================================
 */

import React from "react";
import PersonalInfoSection from "../components/PersonalInfoSection";
import EducationSection from "../components/EducationSection";
import WorkExperienceSection from "../components/WorkExperienceSection";
import OtherInfoSection from "../components/OtherInfoSection";
import type { RegisterFormData, SubjectEntry } from "../types";
import "../styles/Register.css";

/* ═══════════════════════════════════════
 * STATE INTERFACE
 * ═══════════════════════════════════════ */
interface RegisterState {
  formData: RegisterFormData;
  submitted: boolean;
  submittedData: RegisterFormData | null;
  nextSubjectId: number;
}

/* ═══════════════════════════════════════
 * CLASS COMPONENT
 * ═══════════════════════════════════════ */
class Register extends React.Component<Record<string, never>, RegisterState> {

  /* ── constructor() ── */
  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      formData: {
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
      },
      submitted: false,
      submittedData: null,
      nextSubjectId: 2,
    };
  }

  /* ── componentDidMount() ── */
  componentDidMount(): void {
    document.title = "Signup for Free";
  }

  /* ── shouldComponentUpdate() ── */
  shouldComponentUpdate(
    _nextProps: Record<string, never>,
    nextState: RegisterState
  ): boolean {
    const changed = this.state !== nextState;
    return changed;
  }

  /* ── componentDidUpdate() ── */
  componentDidUpdate(
    _prevProps: Record<string, never>,
    _prevState: RegisterState
  ): void {
    // Called after every re-render
  }

  /* ── componentWillUnmount() ── */
  componentWillUnmount(): void {
    document.title = "React App";
  }

  /* ═══════════════════════════════════════
   * EVENT HANDLERS
   * setState with callback form
   * ═══════════════════════════════════════ */

  /** Generic field change — works for string & boolean fields */
  handleFieldChange = (field: keyof RegisterFormData, value: string | boolean) => {
    this.setState((prev) => ({
      formData: { ...prev.formData, [field]: value },
    }));
  };

  /** Education subject row change */
  handleSubjectChange = (id: number, field: keyof SubjectEntry, value: string) => {
    this.setState((prev) => ({
      formData: {
        ...prev.formData,
        subjects: prev.formData.subjects.map((s) =>
          s.id === id ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  /** Add education row */
  handleAddSubject = () => {
    this.setState((prev) => ({
      formData: {
        ...prev.formData,
        subjects: [
          ...prev.formData.subjects,
          { id: prev.nextSubjectId, subject: "", schoolName: "", year: "" },
        ],
      },
      nextSubjectId: prev.nextSubjectId + 1,
    }));
  };

  /** Remove education row */
  handleRemoveSubject = (id: number) => {
    this.setState((prev) => ({
      formData: {
        ...prev.formData,
        subjects: prev.formData.subjects.filter((s) => s.id !== id),
      },
    }));
  };

  /** File upload */
  handleFileChange = (file: File | null) => {
    const name = file ? file.name : "";
    this.setState((prev) => ({
      formData: { ...prev.formData, cvUrl: name },
    }));
  };

  /** Submit */
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({
      submitted: true,
      submittedData: { ...this.state.formData },
    });
  };

  /** Reset */
  handleReset = () => {
    this.setState({
      formData: {
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
      },
      submitted: false,
      submittedData: null,
      nextSubjectId: 2,
    });
  };

  /* ═══════════════════════════════════════
   * render()
   * ═══════════════════════════════════════ */
  render(): React.ReactNode {
    this.renderCount++;
    const { formData, submitted, submittedData } = this.state;


    return (
      <div className="reg">
        <div className="reg__card">
          {/* Header */}
          <div className="reg__header">
            <h2 className="reg__title">Signup for free</h2>
          </div>

          {/* ── Success View ── */}
          {submitted && submittedData && (
            <div className="reg__success">
              <div className="reg__success-icon">✅</div>
              <h3 className="reg__success-title">Registration Complete!</h3>
              <p className="reg__success-name">
                {submittedData.firstName} {submittedData.lastName}
              </p>

              <div className="reg__summary">
                <div className="reg__summary-row">
                  <span>📧 Email</span>
                  <span>{submittedData.email || "—"}</span>
                </div>
                <div className="reg__summary-row">
                  <span>📱 Phone</span>
                  <span>{submittedData.phone || "—"}</span>
                </div>
                <div className="reg__summary-row">
                  <span>👤 Gender</span>
                  <span>{submittedData.gender || "—"}</span>
                </div>
                <div className="reg__summary-row">
                  <span>🎂 DOB</span>
                  <span>{submittedData.dateOfBirth || "—"}</span>
                </div>
                <div className="reg__summary-row">
                  <span>📚 Education</span>
                  <span>{submittedData.subjects.length} entries</span>
                </div>
                <div className="reg__summary-row">
                  <span>💼 Experience</span>
                  <span>{submittedData.workingExperienceYear || "—"}</span>
                </div>
                {submittedData.cvUrl && (
                  <div className="reg__summary-row">
                    <span>📎 CV</span>
                    <span>{submittedData.cvUrl}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="reg__btn reg__btn--outline"
                onClick={this.handleReset}
              >
                Register Another
              </button>
            </div>
          )}

          {/* ── Form ── */}
          {!submitted && (
            <form onSubmit={this.handleSubmit} className="reg__form">
              {/* Section 1 — Personal Info */}
              <PersonalInfoSection
                formData={formData}
                onFieldChange={this.handleFieldChange}
              />

              {/* Section 2 — Education */}
              <EducationSection
                subjects={formData.subjects}
                onSubjectChange={this.handleSubjectChange}
                onAddSubject={this.handleAddSubject}
                onRemoveSubject={this.handleRemoveSubject}
              />

              {/* Section 3 — Work Experience */}
              <WorkExperienceSection
                experienceYear={formData.workingExperienceYear}
                experienceField={formData.workingExperienceField}
                onFieldChange={this.handleFieldChange}
              />

              {/* Section 4 — Other Info */}
              <OtherInfoSection
                interest={formData.interest}
                cvUrl={formData.cvUrl}
                onFieldChange={this.handleFieldChange}
                onFileChange={this.handleFileChange}
              />

              {/* Submit */}
              <div className="reg__actions">
                <button type="submit" className="reg__btn reg__btn--primary">
                  Post
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default Register;
