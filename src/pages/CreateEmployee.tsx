/**
 * ============================================================
 * CreateEmployee — STATEFUL (Class) Component  [PAGE]
 * ============================================================
 * Premium Employee Registration with RICH DEBUG LOGGING
 * for live demo performance analysis.
 *
 * LESSON CONCEPTS DEMONSTRATED:
 *   ✅ Stateful Component (Class Component)
 *   ✅ State & setState() with callback form
 *   ✅ Full Mounting:  constructor → render → componentDidMount
 *   ✅ Full Updating:  shouldComponentUpdate → render → componentDidUpdate
 *   ✅ Unmounting:     componentWillUnmount
 *   ✅ Props flow down to children (InputField, SelectField, RadioGroup)
 *   ✅ Parent state controls child behavior (password visibility)
 *   ✅ Composition — reuses shared /components/
 *
 * DEMO FEATURES:
 *   🎯 Colored console.groupCollapsed logs for every lifecycle
 *   🎯 State diff table in shouldComponentUpdate
 *   🎯 Render count + timing in every log
 *   🎯 Password show/hide (parent state → child prop)
 *   🎯 Password strength meter + criteria checklist
 *   🎯 Real-time field validation indicators
 *   🎯 Live debug badge on screen
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

/* ═══════════════════════════════════════════════════════════
 * DEBUG LOGGING UTILITIES
 * ═══════════════════════════════════════════════════════════ */

const LOG = {
  mount:   "color:#22c55e;font-weight:bold;font-size:12px;",
  render:  "color:#8b5cf6;font-weight:bold;font-size:12px;",
  update:  "color:#f59e0b;font-weight:bold;font-size:12px;",
  unmount: "color:#ef4444;font-weight:bold;font-size:12px;",
  field:   "color:#06b6d4;font-weight:bold;font-size:11px;",
  info:    "color:#888;font-size:10px;",
  dim:     "color:#bbb;font-size:10px;font-style:italic;",
  accent:  "color:#667eea;font-weight:bold;font-size:11px;",
  success: "color:#22c55e;font-weight:bold;font-size:13px;",
  error:   "color:#ef4444;font-weight:bold;font-size:11px;",
};

function ts(): string {
  const d = new Date();
  return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function getPasswordStrength(pw: string) {
  if (!pw) return { level: "none", percent: 0, label: "", color: "#e0e3ea" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 8) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: "weak",        percent: 20,  label: "Weak",        color: "#ef4444" };
  if (s <= 2) return { level: "fair",        percent: 40,  label: "Fair",        color: "#f97316" };
  if (s <= 3) return { level: "medium",      percent: 60,  label: "Medium",      color: "#eab308" };
  if (s <= 4) return { level: "strong",      percent: 80,  label: "Strong",      color: "#22c55e" };
  return             { level: "very-strong", percent: 100, label: "Very Strong", color: "#059669" };
}

/* ═══════════════════════════════════════════════════════════
 * SVG ICON HELPERS (stateless — no state, just UI)
 * ═══════════════════════════════════════════════════════════ */

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
 * STATE INTERFACE
 * ═══════════════════════════════════════════════════════════ */

interface CreateEmployeeState {
  formData: EmployeeFormData;
  errors: string[];
  submitted: boolean;
  submittedData: EmployeeFormData | null;
  focusedField: string;
  /** Parent state → controls child InputField type prop */
  showPassword: boolean;
  showConfirmPassword: boolean;
  /** Track which fields user has visited (for validation hints) */
  touchedFields: Record<string, boolean>;
}

/* ═══════════════════════════════════════════════════════════
 * CLASS COMPONENT
 * ═══════════════════════════════════════════════════════════ */

class CreateEmployee extends React.Component<
  Record<string, never>,
  CreateEmployeeState
> {
  /* ── Instance properties (NOT in state — don't trigger re-render) ── */
  private renderCount = 0;
  private mountTimestamp = 0;
  private lastRenderTimestamp = 0;

  /* ──────────────────────────────────────────────────────────
   * MOUNTING: constructor()
   * Lesson: "constructor() is called first when an instance
   *          of a component is being created."
   * ────────────────────────────────────────────────────────── */
  constructor(props: Record<string, never>) {
    super(props);
    this.mountTimestamp = Date.now();
    this.lastRenderTimestamp = Date.now();

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
      showPassword: false,
      showConfirmPassword: false,
      touchedFields: {},
    };

    /* ── Rich Debug Log ── */
    console.log(
      `%c
╔═══════════════════════════════════════════════════════╗
║   ⚛️  React Class Component — Lifecycle Demo         ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║   MOUNTING PHASE:                                     ║
║   constructor() → render() → componentDidMount()      ║
║                                                       ║
║   UPDATING PHASE (on every setState):                 ║
║   shouldComponentUpdate() → render() →                ║
║   componentDidUpdate()                                ║
║                                                       ║
║   UNMOUNTING PHASE:                                   ║
║   componentWillUnmount()                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝`,
      "color:#667eea;font-family:monospace;font-size:11px;"
    );

    console.groupCollapsed(`%c🏗️ [CreateEmployee] constructor()`, LOG.mount);
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log("%c📦 Initial State:", LOG.info, this.state.formData);
    console.log(
      '%c💡 Lesson: "constructor() is called first — initialise state here, never call setState() in constructor"',
      LOG.dim
    );
    console.groupEnd();
  }

  /* ──────────────────────────────────────────────────────────
   * MOUNTING: componentDidMount()
   * ────────────────────────────────────────────────────────── */
  componentDidMount(): void {
    console.groupCollapsed(
      `%c✅ [CreateEmployee] componentDidMount() — IN THE DOM`,
      LOG.mount
    );
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log(
      `%c📌 Component mounted after render #${this.renderCount}`,
      LOG.info
    );
    console.log("%c🎬 Side-effect: document.title updated", LOG.info);
    console.log(
      '%c💡 Lesson: "componentDidMount() is a good place for subscriptions, API calls, DOM manipulation"',
      LOG.dim
    );
    console.groupEnd();

    document.title = "Create Employee — Premium";
    this.lastRenderTimestamp = Date.now();
  }

  /* ──────────────────────────────────────────────────────────
   * UPDATING: shouldComponentUpdate()
   * Shows a FULL STATE DIFF in the console for demo
   * ────────────────────────────────────────────────────────── */
  shouldComponentUpdate(
    _nextProps: Record<string, never>,
    nextState: CreateEmployeeState
  ): boolean {
    const changes: string[] = [];
    const formDiff: Record<string, string> = {};

    /* Detect which formData fields changed */
    if (this.state.formData !== nextState.formData) {
      (Object.keys(this.state.formData) as (keyof EmployeeFormData)[]).forEach(
        (key) => {
          if (this.state.formData[key] !== nextState.formData[key]) {
            formDiff[key] = `"${this.state.formData[key]}" → "${nextState.formData[key]}"`;
            changes.push(`formData.${key}`);
          }
        }
      );
    }

    /* Detect other state changes */
    if (this.state.errors !== nextState.errors) changes.push("errors");
    if (this.state.submitted !== nextState.submitted) changes.push("submitted");
    if (this.state.submittedData !== nextState.submittedData) changes.push("submittedData");
    if (this.state.focusedField !== nextState.focusedField) changes.push("focusedField");
    if (this.state.showPassword !== nextState.showPassword) changes.push("showPassword");
    if (this.state.showConfirmPassword !== nextState.showConfirmPassword) changes.push("showConfirmPassword");
    if (this.state.touchedFields !== nextState.touchedFields) changes.push("touchedFields");

    const shouldUpdate = changes.length > 0;
    const elapsed = ((Date.now() - this.lastRenderTimestamp) / 1000).toFixed(3);

    console.groupCollapsed(
      `%c🤔 [CreateEmployee] shouldComponentUpdate() → ${shouldUpdate ? "✅ YES (will re-render)" : "⛔ NO (skip)"}`,
      shouldUpdate ? LOG.update : LOG.dim
    );
    console.log(
      `%c⏱️ ${ts()} | Render #${this.renderCount}${shouldUpdate ? ` → #${this.renderCount + 1}` : ""} | Δ${elapsed}s since last render`,
      LOG.dim
    );

    if (changes.length > 0) {
      console.log(`%c🔍 Changed keys: [${changes.join(", ")}]`, LOG.field);
      if (Object.keys(formDiff).length > 0) {
        console.log("%c📊 Form Data Diff:", LOG.info);
        console.table(formDiff);
      }
      if (changes.includes("showPassword"))
        console.log(
          `%c👁️ Password visibility: ${nextState.showPassword ? "VISIBLE" : "HIDDEN"}`,
          LOG.field
        );
      if (changes.includes("showConfirmPassword"))
        console.log(
          `%c👁️ Confirm Password visibility: ${nextState.showConfirmPassword ? "VISIBLE" : "HIDDEN"}`,
          LOG.field
        );
    } else {
      console.log(
        "%c💤 No state changes — re-render skipped for performance",
        LOG.dim
      );
    }
    console.log(
      '%c💡 Lesson: "shouldComponentUpdate() optimises by skipping unnecessary re-renders"',
      LOG.dim
    );
    console.groupEnd();

    return shouldUpdate;
  }

  /* ──────────────────────────────────────────────────────────
   * UPDATING: componentDidUpdate()
   * ────────────────────────────────────────────────────────── */
  componentDidUpdate(
    _prevProps: Record<string, never>,
    prevState: CreateEmployeeState
  ): void {
    const sinceMount = ((Date.now() - this.mountTimestamp) / 1000).toFixed(2);
    const sinceLast = ((Date.now() - this.lastRenderTimestamp) / 1000).toFixed(3);

    console.groupCollapsed(
      `%c🔄 [CreateEmployee] componentDidUpdate() — render #${this.renderCount}`,
      LOG.update
    );
    console.log(
      `%c⏱️ ${ts()} | +${sinceMount}s since mount | Δ${sinceLast}s since last render`,
      LOG.dim
    );

    /* What triggered this update? */
    if (prevState.formData !== this.state.formData) {
      console.log("%c📝 Form Data (current snapshot):", LOG.field);
      console.table(this.state.formData);
    }
    if (prevState.submitted !== this.state.submitted && this.state.submitted) {
      console.log(
        "%c🎉 FORM SUBMITTED!",
        "color:#22c55e;font-weight:bold;font-size:16px;"
      );
      console.log("%c📋 Submitted Data:", LOG.info, this.state.submittedData);
    }
    if (
      prevState.errors !== this.state.errors &&
      this.state.errors.length > 0
    ) {
      console.log(
        "%c❌ Validation Errors:",
        LOG.error,
        this.state.errors
      );
    }

    /* Progress */
    const fields = [
      this.state.formData.firstName,
      this.state.formData.lastName,
      this.state.formData.password,
      this.state.formData.confirmPassword,
      this.state.formData.email,
      this.state.formData.phone,
      this.state.formData.securityQuestion,
      this.state.formData.securityAnswer,
    ];
    const filled = fields.filter((f) => f.trim().length > 0).length;
    console.log(
      `%c📊 Progress: ${Math.round((filled / fields.length) * 100)}% (${filled}/${fields.length} fields filled)`,
      LOG.info
    );
    console.log(
      '%c💡 Lesson: "componentDidUpdate() runs after the DOM has been updated"',
      LOG.dim
    );
    console.groupEnd();

    this.lastRenderTimestamp = Date.now();
  }

  /* ──────────────────────────────────────────────────────────
   * UNMOUNTING: componentWillUnmount()
   * ────────────────────────────────────────────────────────── */
  componentWillUnmount(): void {
    const totalTime = ((Date.now() - this.mountTimestamp) / 1000).toFixed(2);
    console.groupCollapsed(
      `%c🧹 [CreateEmployee] componentWillUnmount()`,
      LOG.unmount
    );
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log(
      `%c📊 Total renders: ${this.renderCount} | Alive for: ${totalTime}s`,
      LOG.info
    );
    console.log("%c🎬 Cleaning up: resetting document.title", LOG.info);
    console.log(
      '%c💡 Lesson: "componentWillUnmount() — clean up subscriptions, timers, DOM refs"',
      LOG.dim
    );
    console.groupEnd();

    document.title = "React App";
  }

  /* ──────────────────────────────────────────────────────────
   * setState with callback form
   * Lesson: "Always use setState(). Never mutate this.state."
   * ────────────────────────────────────────────────────────── */
  handleFieldChange = (field: keyof EmployeeFormData) => (value: string) => {
    const oldValue = this.state.formData[field];

    console.groupCollapsed(
      `%c✏️ [CreateEmployee] Field Changed: ${field}`,
      LOG.field
    );
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    console.log(`%c📝 "${oldValue}" → "${value}"`, LOG.info);
    console.log(
      '%c💡 Lesson: "setState((prevState) => ...) — callback form ensures latest state"',
      LOG.dim
    );
    console.groupEnd();

    this.setState((prevState) => ({
      formData: { ...prevState.formData, [field]: value },
      errors: [],
    }));
  };

  /* Focus / Blur — compact logs */
  handleFocus = (field: string) => () => {
    console.log(`%c  👆 focus → ${field}`, "color:#ccc;font-size:10px;");
    this.setState({ focusedField: field });
  };

  handleBlur = (field: string) => () => {
    console.log(
      `%c  👋 blur ← ${field} (marked touched)`,
      "color:#ccc;font-size:10px;"
    );
    this.setState((prev) => ({
      focusedField: "",
      touchedFields: { ...prev.touchedFields, [field]: true },
    }));
  };

  /* ──────────────────────────────────────────────────────────
   * Password Visibility Toggles
   * Lesson: Parent state (showPassword) controls child
   *         InputField's type prop ("text" vs "password").
   * ────────────────────────────────────────────────────────── */
  togglePassword = () => {
    const next = !this.state.showPassword;
    console.groupCollapsed(`%c👁️ [CreateEmployee] Password Toggle`, LOG.accent);
    console.log(
      `%c${next ? "SHOWING" : "HIDING"} password text`,
      LOG.info
    );
    console.log(
      `%c💡 Parent state → child prop: type="${next ? "text" : "password"}"`,
      LOG.dim
    );
    console.groupEnd();
    this.setState({ showPassword: next });
  };

  toggleConfirmPassword = () => {
    const next = !this.state.showConfirmPassword;
    console.groupCollapsed(
      `%c👁️ [CreateEmployee] Confirm Password Toggle`,
      LOG.accent
    );
    console.log(
      `%c${next ? "SHOWING" : "HIDING"} confirm password text`,
      LOG.info
    );
    console.groupEnd();
    this.setState({ showConfirmPassword: next });
  };

  /* ── Validation ── */
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
    )
      errs.push("All fields are required.");
    if (formData.email && !isValidEmail(formData.email))
      errs.push("Please enter a valid email address.");
    if (formData.phone && !isValidPhone(formData.phone))
      errs.push("Please enter a valid phone number.");
    if (formData.password && !doPasswordsMatch(formData.password, formData.confirmPassword))
      errs.push("Passwords do not match.");
    if (formData.password && formData.password.length < 6)
      errs.push("Password must be at least 6 characters.");
    return errs;
  };

  /* ── Submit ── */
  handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const errs = this.validate();

    console.groupCollapsed(
      `%c🎯 [CreateEmployee] handleSubmit()`,
      errs.length > 0 ? LOG.error : LOG.success
    );
    console.log(`%c⏱️ ${ts()}`, LOG.dim);
    if (errs.length > 0) {
      console.log("%c❌ Validation failed:", LOG.error, errs);
    } else {
      console.log("%c✅ Validation passed — submitting!", LOG.success);
      console.log("%c📋 Data:", LOG.info, this.state.formData);
    }
    console.groupEnd();

    if (errs.length > 0) {
      this.setState({ errors: errs });
      return;
    }
    this.setState({
      submitted: true,
      submittedData: { ...this.state.formData },
      errors: [],
    });
  };

  /* ── Reset ── */
  handleReset = (): void => {
    console.groupCollapsed(`%c🔃 [CreateEmployee] handleReset()`, LOG.accent);
    console.log(`%c⏱️ ${ts()} — clearing all state`, LOG.dim);
    console.groupEnd();

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
      showPassword: false,
      showConfirmPassword: false,
      touchedFields: {},
    });
  };

  /* ── Options ── */
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

  /* ──────────────────────────────────────────────────────────
   * MOUNTING / UPDATING: render()
   * ────────────────────────────────────────────────────────── */
  render(): React.ReactNode {
    this.renderCount++;
    const {
      formData,
      errors,
      submitted,
      submittedData,
      showPassword,
      showConfirmPassword,
      touchedFields,
    } = this.state;

    /* ── Derived calculations ── */
    const formFields = [
      formData.firstName,
      formData.lastName,
      formData.password,
      formData.confirmPassword,
      formData.email,
      formData.phone,
      formData.securityQuestion,
      formData.securityAnswer,
    ];
    const filledCount = formFields.filter((f) => f.trim().length > 0).length;
    const progress = Math.round((filledCount / formFields.length) * 100);
    const strength = getPasswordStrength(formData.password);
    const pwMatch =
      formData.password && formData.confirmPassword
        ? doPasswordsMatch(formData.password, formData.confirmPassword)
        : null;

    /* ── Rich render log ── */
    const sinceMountSec = ((Date.now() - this.mountTimestamp) / 1000).toFixed(2);
    console.groupCollapsed(
      `%c🎨 [CreateEmployee] render() #${this.renderCount}`,
      LOG.render
    );
    console.log(`%c⏱️ ${ts()} | +${sinceMountSec}s since mount`, LOG.dim);
    console.log(
      `%c📊 Progress: ${progress}% (${filledCount}/${formFields.length}) | 🔐 Strength: ${strength.label || "N/A"}`,
      LOG.info
    );
    console.log(
      '%c💡 Lesson: "render() is pure — called during both Mounting and Updating phases"',
      LOG.dim
    );
    console.groupEnd();

    return (
      <div className="ce">
        {/* ── Decorative blobs ── */}
        <div className="ce__blob ce__blob--1" />
        <div className="ce__blob ce__blob--2" />
        <div className="ce__blob ce__blob--3" />

        <div className="ce__card">
          {/* ── Live debug badge ── */}
          <div className="ce__debug-badge">
            <span className="ce__debug-dot" />
            Render #{this.renderCount} &bull; {progress}% &bull; {filledCount}/
            {formFields.length}
          </div>

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
            <p className="ce__subtitle">
              Fill in the details below to register a new team member
            </p>
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

          {/* ══════════════════════════════════════════════
           *  SUCCESS VIEW
           * ══════════════════════════════════════════════ */}
          {submitted && submittedData && (
            <div className="ce__success">
              <div className="ce__success-check">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="ce__success-title">Welcome aboard! 🎉</h3>
              <p className="ce__success-name">
                {submittedData.firstName} {submittedData.lastName}
              </p>
              <p className="ce__success-subtitle">
                has been successfully registered
              </p>

              {/* Summary card */}
              <div className="ce__summary">
                <div className="ce__summary-row">
                  <span className="ce__summary-label">📧 Email</span>
                  <span className="ce__summary-value">
                    {submittedData.email}
                  </span>
                </div>
                <div className="ce__summary-row">
                  <span className="ce__summary-label">📱 Phone</span>
                  <span className="ce__summary-value">
                    {submittedData.phone}
                  </span>
                </div>
                <div className="ce__summary-row">
                  <span className="ce__summary-label">👤 Gender</span>
                  <span className="ce__summary-value">
                    {submittedData.gender === "male" ? "👨 Male" : "👩 Female"}
                  </span>
                </div>
                <div className="ce__summary-row">
                  <span className="ce__summary-label">🛡️ Security</span>
                  <span className="ce__summary-value ce__summary-value--ok">
                    ✓ Configured
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="ce__btn ce__btn--outline"
                onClick={this.handleReset}
              >
                Register Another Employee
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════
           *  FORM
           * ══════════════════════════════════════════════ */}
          {!submitted && (
            <form onSubmit={this.handleSubmit} className="ce__form">
              {/* ── Section 1: Personal Info ── */}
              <div className="ce__section">
                <h3 className="ce__section-title">
                  <span className="ce__section-num">1</span>
                  Personal Information
                </h3>

                <div className="ce__grid">
                  {/* First Name */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("firstName")}
                    onBlur={this.handleBlur("firstName")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      First Name
                    </label>
                    <InputField
                      type="text"
                      name="firstName"
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={this.handleFieldChange("firstName")}
                    />
                  </div>

                  {/* Last Name */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("lastName")}
                    onBlur={this.handleBlur("lastName")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      Last Name
                    </label>
                    <InputField
                      type="text"
                      name="lastName"
                      placeholder="e.g. Smith"
                      value={formData.lastName}
                      onChange={this.handleFieldChange("lastName")}
                    />
                  </div>

                  {/* Email */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("email")}
                    onBlur={this.handleBlur("email")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                      Email Address
                    </label>
                    <InputField
                      type="email"
                      name="email"
                      placeholder="e.g. john@company.com"
                      value={formData.email}
                      onChange={this.handleFieldChange("email")}
                    />
                    {/* Live validation after blur */}
                    {touchedFields.email && formData.email && (
                      <div
                        className={`ce__field-hint ${
                          isValidEmail(formData.email)
                            ? "ce__field-hint--valid"
                            : "ce__field-hint--invalid"
                        }`}
                      >
                        {isValidEmail(formData.email)
                          ? "✓ Valid email address"
                          : "✗ Please enter a valid email"}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("phone")}
                    onBlur={this.handleBlur("phone")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      Phone Number
                    </label>
                    <InputField
                      type="tel"
                      name="phone"
                      placeholder="e.g. +855 12 345 678"
                      value={formData.phone}
                      onChange={this.handleFieldChange("phone")}
                    />
                    {touchedFields.phone && formData.phone && (
                      <div
                        className={`ce__field-hint ${
                          isValidPhone(formData.phone)
                            ? "ce__field-hint--valid"
                            : "ce__field-hint--invalid"
                        }`}
                      >
                        {isValidPhone(formData.phone)
                          ? "✓ Valid phone number"
                          : "✗ Please enter a valid phone number"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gender */}
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

              {/* ── Section 2: Security ── */}
              <div className="ce__section">
                <h3 className="ce__section-title">
                  <span className="ce__section-num">2</span>
                  Security
                </h3>

                <div className="ce__grid">
                  {/* Password with eye toggle + strength */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("password")}
                    onBlur={this.handleBlur("password")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Password
                    </label>
                    <div className="ce__password-wrapper">
                      <InputField
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={this.handleFieldChange("password")}
                      />
                      <button
                        type="button"
                        className="ce__eye-toggle"
                        onClick={this.togglePassword}
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {formData.password && (
                      <div className="ce__strength">
                        <div className="ce__strength-bar">
                          <div
                            className="ce__strength-fill"
                            style={{
                              width: `${strength.percent}%`,
                              background: strength.color,
                            }}
                          />
                        </div>
                        <span
                          className="ce__strength-label"
                          style={{ color: strength.color }}
                        >
                          {strength.label}
                        </span>
                      </div>
                    )}

                    {/* Password criteria checklist */}
                    {formData.password && (
                      <div className="ce__pw-criteria">
                        <div
                          className={`ce__criteria ${formData.password.length >= 6 ? "ce__criteria--met" : ""}`}
                        >
                          <span className="ce__criteria-icon">
                            {formData.password.length >= 6 ? "✓" : "○"}
                          </span>
                          At least 6 characters
                        </div>
                        <div
                          className={`ce__criteria ${/[A-Z]/.test(formData.password) ? "ce__criteria--met" : ""}`}
                        >
                          <span className="ce__criteria-icon">
                            {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                          </span>
                          Contains uppercase letter
                        </div>
                        <div
                          className={`ce__criteria ${/[0-9]/.test(formData.password) ? "ce__criteria--met" : ""}`}
                        >
                          <span className="ce__criteria-icon">
                            {/[0-9]/.test(formData.password) ? "✓" : "○"}
                          </span>
                          Contains a number
                        </div>
                        <div
                          className={`ce__criteria ${/[^A-Za-z0-9]/.test(formData.password) ? "ce__criteria--met" : ""}`}
                        >
                          <span className="ce__criteria-icon">
                            {/[^A-Za-z0-9]/.test(formData.password) ? "✓" : "○"}
                          </span>
                          Contains special character
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password with eye toggle + match indicator */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("confirmPassword")}
                    onBlur={this.handleBlur("confirmPassword")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Confirm Password
                    </label>
                    <div className="ce__password-wrapper">
                      <InputField
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={this.handleFieldChange("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="ce__eye-toggle"
                        onClick={this.toggleConfirmPassword}
                        tabIndex={-1}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {/* Password match indicator */}
                    {pwMatch !== null && (
                      <div
                        className={`ce__field-hint ${
                          pwMatch
                            ? "ce__field-hint--valid"
                            : "ce__field-hint--invalid"
                        }`}
                      >
                        {pwMatch
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </div>
                    )}
                  </div>

                  {/* Security Question */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("securityQuestion")}
                    onBlur={this.handleBlur("securityQuestion")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      Security Question
                    </label>
                    <SelectField
                      name="securityQuestion"
                      placeholder="Choose a question"
                      value={formData.securityQuestion}
                      onChange={(v: string) =>
                        this.handleFieldChange("securityQuestion")(
                          v as SecurityQuestion
                        )
                      }
                      options={this.securityQuestionOptions}
                    />
                  </div>

                  {/* Security Answer */}
                  <div
                    className="ce__field"
                    onFocus={this.handleFocus("securityAnswer")}
                    onBlur={this.handleBlur("securityAnswer")}
                  >
                    <label className="ce__label">
                      <svg className="ce__label-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      Security Answer
                    </label>
                    <InputField
                      type="text"
                      name="securityAnswer"
                      placeholder="Your answer"
                      value={formData.securityAnswer}
                      onChange={this.handleFieldChange("securityAnswer")}
                    />
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="ce__actions">
                <button
                  type="button"
                  className="ce__btn ce__btn--ghost"
                  onClick={this.handleReset}
                >
                  Clear Form
                </button>
                <button type="submit" className="ce__btn ce__btn--primary">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
