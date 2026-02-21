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
 * Console log styles for demo
 * ═══════════════════════════════════════ */
const LOG = {
  mount:   "color:#667eea;font-weight:bold;font-size:12px;",
  update:  "color:#f59e0b;font-weight:bold;font-size:11px;",
  unmount: "color:#ef4444;font-weight:bold;font-size:12px;",
  field:   "color:#3b82f6;font-weight:bold;font-size:11px;",
  render:  "color:#8b5cf6;font-weight:bold;font-size:11px;",
  info:    "color:#888;font-size:10px;",
  dim:     "color:#bbb;font-size:10px;font-style:italic;",
  success: "color:#22c55e;font-weight:bold;font-size:13px;",
  error:   "color:#ef4444;font-weight:bold;font-size:11px;",
};

function ts(): string {
  const d = new Date();
  return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

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
  private renderCount = 0;
  private mountTimestamp = 0;

  /* ── constructor() ── */
  constructor(props: Record<string, never>) {
    super(props);
    this.mountTimestamp = Date.now();

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

    console.groupCollapsed(`%c🏗️ [Register] constructor()`, LOG.mount);
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log("%c📦 Initial State:", LOG.info, this.state.formData);
    console.log('%c💡 "constructor() → initialise state, never call setState here"', LOG.dim);
    console.groupEnd();
  }

  /* ── componentDidMount() ── */
  componentDidMount(): void {
    console.groupCollapsed(`%c✅ [Register] componentDidMount()`, LOG.mount);
    console.log(`%c⏱️ ${ts()} — Component is now in the DOM`, LOG.dim);
    console.log('%c💡 "Good place for API calls, subscriptions, DOM manipulation"', LOG.dim);
    console.groupEnd();
    document.title = "Signup for Free";
  }

  /* ── shouldComponentUpdate() ── */
  shouldComponentUpdate(
    _nextProps: Record<string, never>,
    nextState: RegisterState
  ): boolean {
    const changed = this.state !== nextState;
    console.groupCollapsed(
      `%c🤔 [Register] shouldComponentUpdate() → ${changed ? "✅ YES" : "⛔ NO"}`,
      changed ? LOG.update : LOG.dim
    );
    console.log(`%c⏱️ ${ts()} | Render #${this.renderCount}${changed ? ` → #${this.renderCount + 1}` : ""}`, LOG.dim);
    console.log('%c💡 "Optimise by returning false to skip unnecessary re-renders"', LOG.dim);
    console.groupEnd();
    return changed;
  }

  /* ── componentDidUpdate() ── */
  componentDidUpdate(
    _prevProps: Record<string, never>,
    prevState: RegisterState
  ): void {
    const sinceMount = ((Date.now() - this.mountTimestamp) / 1000).toFixed(2);
    console.groupCollapsed(
      `%c🔄 [Register] componentDidUpdate() — render #${this.renderCount}`,
      LOG.update
    );
    console.log(`%c⏱️ ${ts()} | +${sinceMount}s since mount`, LOG.dim);

    if (prevState.submitted !== this.state.submitted && this.state.submitted) {
      console.log("%c🎉 FORM SUBMITTED!", "color:#22c55e;font-weight:bold;font-size:16px;");
      console.log("%c📋 Submitted Data:", LOG.info, this.state.submittedData);
    }
    console.log('%c💡 "componentDidUpdate() runs after DOM has been updated"', LOG.dim);
    console.groupEnd();
  }

  /* ── componentWillUnmount() ── */
  componentWillUnmount(): void {
    const totalTime = ((Date.now() - this.mountTimestamp) / 1000).toFixed(2);
    console.groupCollapsed(`%c🧹 [Register] componentWillUnmount()`, LOG.unmount);
    console.log(`%c⏱️ ${ts()} | Total renders: ${this.renderCount} | Alive: ${totalTime}s`, LOG.dim);
    console.log('%c💡 "Clean up subscriptions, timers, DOM refs"', LOG.dim);
    console.groupEnd();
    document.title = "React App";
  }

  /* ═══════════════════════════════════════
   * EVENT HANDLERS
   * setState with callback form
   * ═══════════════════════════════════════ */

  /** Generic field change — works for string & boolean fields */
  handleFieldChange = (field: keyof RegisterFormData, value: string | boolean) => {
    console.groupCollapsed(`%c✏️ [Register] Field: ${field}`, LOG.field);
    console.log(`%c⏱️ ${ts()} | "${this.state.formData[field]}" → "${value}"`, LOG.dim);
    console.log('%c💡 "setState((prev) => ...) — callback form for latest state"', LOG.dim);
    console.groupEnd();

    this.setState((prev) => ({
      formData: { ...prev.formData, [field]: value },
    }));
  };

  /** Education subject row change */
  handleSubjectChange = (id: number, field: keyof SubjectEntry, value: string) => {
    console.log(`%c  📚 Subject #${id}.${field} → "${value}"`, LOG.info);

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
    console.log(`%c  ➕ Add education row #${this.state.nextSubjectId}`, LOG.info);

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
    console.log(`%c  ➖ Remove education row #${id}`, LOG.info);

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
    console.log(`%c  📎 File: ${name || "(cleared)"}`, LOG.info);

    this.setState((prev) => ({
      formData: { ...prev.formData, cvUrl: name },
    }));
  };

  /** Submit */
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.groupCollapsed(`%c🎯 [Register] handleSubmit()`, LOG.success);
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log("%c📋 Data:", LOG.info, this.state.formData);
    console.groupEnd();

    this.setState({
      submitted: true,
      submittedData: { ...this.state.formData },
    });
  };

  /** Reset */
  handleReset = () => {
    console.log(`%c🔃 [Register] Reset form`, LOG.info);
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

    console.groupCollapsed(`%c🎨 [Register] render() #${this.renderCount}`, LOG.render);
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log('%c💡 "render() is pure — called during Mounting & Updating"', LOG.dim);
    console.groupEnd();

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
