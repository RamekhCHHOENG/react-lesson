/**
 * ============================================================
 * CreateEmployee — STATEFUL (Class) Component  [PAGE]
 * ============================================================
 * A beautiful, premium version of the Employee Registration form.
 *
 * LESSON CONCEPTS (same as RegistrationForm, fully applied):
 *
 *   ✅ Stateful Component (Class Component)
 *   ✅ State & setState() with callback form
 *   ✅ Full Mounting lifecycle: constructor → render → componentDidMount
 *   ✅ Full Updating lifecycle: shouldComponentUpdate → render → componentDidUpdate
 *   ✅ Unmounting lifecycle: componentWillUnmount
 *   ✅ Props passed down to children (InputField, SelectField, RadioGroup)
 *   ✅ State vs Props demonstrated
 *   ✅ Composition — reuses the same /components/ as the original page
 * ============================================================
 */

import React from "react";
import { InputField, SelectField, RadioGroup } from "../components";
import type { EmployeeFormData, SecurityQuestion } from "../types";
import {
  isValidEmail,
  isValidPhone,
  doPasswordsMatch,
  isFormComplete,
} from "../utils";
import "../styles/CreateEmployee.css";

/** State shape — identical to RegistrationForm */
interface CreateEmployeeState {
  formData: EmployeeFormData;
  errors: string[];
  submitted: boolean;
  submittedData: EmployeeFormData | null;
  /** Track which field is currently focused (for label animation) */
  focusedField: string;
}

class CreateEmployee extends React.Component<
  Record<string, never>,
  CreateEmployeeState
> {
  /* ────────────────────────────────────────────────────────
   * MOUNTING: constructor()
   * Lesson: "constructor() is called first when an instance
   *          of a component is being created."
   * WHY: Initialise state before any rendering happens.
   * ──────────────────────────────────────────────────────── */
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      formData: {
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: "",
        securityQuestion: "",
        securityAnswer: "",
        gender: "male",
      },
      errors: [],
      submitted: false,
      submittedData: null,
      focusedField: "",
    };
    console.log("[CreateEmployee] constructor() — state initialised");
  }

  /* ────────────────────────────────────────────────────────
   * MOUNTING: componentDidMount()
   * Lesson: "This method is a good place to set up any
   *          subscriptions."
   * WHY: Runs once after first render. Safe for side-effects
   *       like setting document.title or fetching data.
   * ──────────────────────────────────────────────────────── */
  componentDidMount(): void {
    console.log("[CreateEmployee] componentDidMount() — component is in the DOM");
    document.title = "Create Employee — Premium";
  }

  /* ────────────────────────────────────────────────────────
   * UPDATING: shouldComponentUpdate()
   * Lesson: "shouldComponentUpdate() is called during
   *          the updating phase."
   * WHY: Performance optimisation — skip re-render if the
   *       relevant state hasn't actually changed.
   * ──────────────────────────────────────────────────────── */
  shouldComponentUpdate(
    _nextProps: Record<string, never>,
    nextState: CreateEmployeeState
  ): boolean {
    console.log("[CreateEmployee] shouldComponentUpdate()");
    if (
      this.state.formData === nextState.formData &&
      this.state.errors === nextState.errors &&
      this.state.submitted === nextState.submitted &&
      this.state.focusedField === nextState.focusedField
    ) {
      return false;
    }
    return true;
  }

  /* ────────────────────────────────────────────────────────
   * UPDATING: componentDidUpdate()
   * Lesson: "An update can be caused by changes to props
   *          or state."
   * WHY: React to state changes after re-render.
   * ──────────────────────────────────────────────────────── */
  componentDidUpdate(
    _prevProps: Record<string, never>,
    prevState: CreateEmployeeState
  ): void {
    if (prevState.submitted !== this.state.submitted && this.state.submitted) {
      console.log("[CreateEmployee] componentDidUpdate() — form was submitted!");
    }
  }

  /* ────────────────────────────────────────────────────────
   * UNMOUNTING: componentWillUnmount()
   * Lesson: "don't forget to unsubscribe in
   *          componentWillUnmount()."
   * WHY: Clean up side-effects to prevent memory leaks.
   * ──────────────────────────────────────────────────────── */
  componentWillUnmount(): void {
    console.log("[CreateEmployee] componentWillUnmount() — cleaning up");
    document.title = "React App";
  }

  /* ────────────────────────────────────────────────────────
   * setState with callback form
   * Lesson: "Always use setState." / Never mutate this.state.
   * WHY callback: setState is async — (prevState) => ...
   *   ensures we always read the latest previous value.
   * ──────────────────────────────────────────────────────── */
  handleFieldChange = (field: keyof EmployeeFormData) => (value: string) => {
    console.log(`[CreateEmployee] Field changed: ${field} =`, value);
    this.setState((prevState) => ({
      formData: { ...prevState.formData, [field]: value },
      errors: [],
    }));
  };

  handleFocus = (field: string) => {
    this.setState({ focusedField: field });
  };

  handleBlur = () => {
    this.setState({ focusedField: "" });
  };

  validate = (): string[] => {
    const errs: string[] = [];
    const { formData } = this.state;

    if (
      !isFormComplete({
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        email: formData.email,
        phone: formData.phone,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
      })
    ) {
      errs.push("All fields are required.");
    }
    if (formData.email && !isValidEmail(formData.email)) {
      errs.push("Please enter a valid email address.");
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.push("Please enter a valid phone number.");
    }
    if (
      formData.password &&
      !doPasswordsMatch(formData.password, formData.confirmPassword)
    ) {
      errs.push("Passwords do not match.");
    }
    if (formData.password && formData.password.length < 6) {
      errs.push("Password must be at least 6 characters.");
    }
    return errs;
  };

  handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const errs = this.validate();
    if (errs.length > 0) {
      this.setState({ errors: errs });
      return;
    }
    this.setState({
      submitted: true,
      submittedData: { ...this.state.formData },
      errors: [],
    });
    console.log("[CreateEmployee] Form submitted:", this.state.formData);
  };

  handleReset = (): void => {
    this.setState({
      formData: {
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        email: "",
        phone: "",
        securityQuestion: "",
        securityAnswer: "",
        gender: "male",
      },
      errors: [],
      submitted: false,
      submittedData: null,
      focusedField: "",
    });
  };

  securityQuestionOptions = [
    { value: "What is your pet's name?", label: "What is your pet's name?" },
    { value: "What city were you born in?", label: "What city were you born in?" },
    { value: "What is your mother's maiden name?", label: "What is your mother's maiden name?" },
    { value: "What was the name of your first school?", label: "What was the name of your first school?" },
  ];

  genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  /* ────────────────────────────────────────────────────────
   * MOUNTING / UPDATING: render()
   * Lesson: "render() is called during both Mounting
   *          and Updating phases."
   * ──────────────────────────────────────────────────────── */
  render(): React.ReactNode {
    const { formData, errors, submitted, submittedData } = this.state;

    /** Calculate form completeness for the progress bar */
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.password,
      formData.confirmPassword,
      formData.email,
      formData.phone,
      formData.securityQuestion,
      formData.securityAnswer,
    ];
    const filledCount = fields.filter((f) => f.trim().length > 0).length;
    const progress = Math.round((filledCount / fields.length) * 100);

    return (
      <div className="ce">
        {/* ── Decorative background blobs ── */}
        <div className="ce__blob ce__blob--1" />
        <div className="ce__blob ce__blob--2" />
        <div className="ce__blob ce__blob--3" />

        <div className="ce__card">
          {/* ── Header ── */}
          <div className="ce__header">
            <div className="ce__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h2 className="ce__title">Create New Employee</h2>
            <p className="ce__subtitle">Fill in the details below to register a new team member</p>
          </div>

          {/* ── Progress bar ── */}
          {!submitted && (
            <div className="ce__progress-wrap">
              <div className="ce__progress-bar">
                <div
                  className="ce__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="ce__progress-label">{progress}% complete</span>
            </div>
          )}

          {/* ── Errors ── */}
          {errors.length > 0 && (
            <div className="ce__errors">
              <div className="ce__errors-icon">⚠️</div>
              <div className="ce__errors-list">
                {errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {submitted && submittedData && (
            <div className="ce__success">
              <div className="ce__success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Welcome aboard!</h3>
              <p>
                <strong>{submittedData.firstName} {submittedData.lastName}</strong> has been
                successfully registered.
              </p>
              <button type="button" className="ce__btn ce__btn--outline" onClick={this.handleReset}>
                Register Another Employee
              </button>
            </div>
          )}

          {/* ── Form ── */}
          {!submitted && (
            <form onSubmit={this.handleSubmit} className="ce__form">
              {/* Section: Personal Info */}
              <div className="ce__section">
                <h3 className="ce__section-title">
                  <span className="ce__section-num">1</span>
                  Personal Information
                </h3>
                <div className="ce__grid">
                  <div className="ce__field" onFocus={() => this.handleFocus("firstName")} onBlur={this.handleBlur}>
                    <label className="ce__label">First Name</label>
                    <InputField type="text" name="firstName" placeholder="e.g. John" value={formData.firstName} onChange={this.handleFieldChange("firstName")} />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("lastName")} onBlur={this.handleBlur}>
                    <label className="ce__label">Last Name</label>
                    <InputField type="text" name="lastName" placeholder="e.g. Smith" value={formData.lastName} onChange={this.handleFieldChange("lastName")} />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("email")} onBlur={this.handleBlur}>
                    <label className="ce__label">Email Address</label>
                    <InputField type="email" name="email" placeholder="e.g. john@company.com" value={formData.email} onChange={this.handleFieldChange("email")} />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("phone")} onBlur={this.handleBlur}>
                    <label className="ce__label">Phone Number</label>
                    <InputField type="tel" name="phone" placeholder="e.g. +855 12 345 678" value={formData.phone} onChange={this.handleFieldChange("phone")} />
                  </div>
                </div>
                <div className="ce__gender-row">
                  <label className="ce__label">Gender</label>
                  <RadioGroup
                    name="gender"
                    value={formData.gender}
                    onChange={this.handleFieldChange("gender")}
                    options={this.genderOptions}
                  />
                </div>
              </div>

              {/* Section: Security */}
              <div className="ce__section">
                <h3 className="ce__section-title">
                  <span className="ce__section-num">2</span>
                  Security
                </h3>
                <div className="ce__grid">
                  <div className="ce__field" onFocus={() => this.handleFocus("password")} onBlur={this.handleBlur}>
                    <label className="ce__label">Password</label>
                    <InputField type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={this.handleFieldChange("password")} />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("confirmPassword")} onBlur={this.handleBlur}>
                    <label className="ce__label">Confirm Password</label>
                    <InputField type="password" name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={this.handleFieldChange("confirmPassword")} />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("securityQuestion")} onBlur={this.handleBlur}>
                    <label className="ce__label">Security Question</label>
                    <SelectField
                      name="securityQuestion"
                      placeholder="Choose a question"
                      value={formData.securityQuestion}
                      onChange={(v: string) =>
                        this.handleFieldChange("securityQuestion")(v as SecurityQuestion)
                      }
                      options={this.securityQuestionOptions}
                    />
                  </div>
                  <div className="ce__field" onFocus={() => this.handleFocus("securityAnswer")} onBlur={this.handleBlur}>
                    <label className="ce__label">Security Answer</label>
                    <InputField type="text" name="securityAnswer" placeholder="Your answer" value={formData.securityAnswer} onChange={this.handleFieldChange("securityAnswer")} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ce__actions">
                <button type="button" className="ce__btn ce__btn--ghost" onClick={this.handleReset}>
                  Clear Form
                </button>
                <button type="submit" className="ce__btn ce__btn--primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Create Employee
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default CreateEmployee;
