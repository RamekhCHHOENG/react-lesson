/**
 * ============================================================
 * RegistrationForm — STATEFUL (Class) Component  [PAGE]
 * ============================================================
 * This is the main "Apply as a Employee" form shown in the
 * exercise screenshot.
 *
 * LESSON CONCEPT APPLIED:
 *
 *   ✅ Stateful Component (Class Component):
 *      "Stateful components can hold state."
 *      The form data (firstName, email, etc.) lives in this
 *      component's state.
 *
 *   ✅ State:
 *      "State is data maintained inside a component. It is
 *       local or owned by that specific component."
 *      The form fields are local state — no other component
 *       needs to own them.
 *
 *   ✅ setState():
 *      "The component itself will update the state using the
 *       setState() function."  /  "Always use setState."
 *      Every input change calls setState to update the form.
 *
 *   ✅ Mounting Lifecycle:
 *      constructor() → render() → componentDidMount()
 *
 *   ✅ Updating Lifecycle:
 *      shouldComponentUpdate() → render() → componentDidUpdate()
 *
 *   ✅ Unmounting Lifecycle:
 *      componentWillUnmount()
 *
 *   ✅ Props → Children (Composition):
 *      The form uses child components (InputField, SelectField,
 *      RadioGroup) and passes props down to them.
 *
 *   ✅ State vs Props:
 *      - State: form data lives HERE, is changeable.
 *      - Props: form data is passed DOWN to children, read-only.
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
import "../styles/RegistrationForm.css";

/** State shape for this component */
interface RegistrationFormState {
  formData: EmployeeFormData;
  errors: string[];
  submitted: boolean;
  submittedData: EmployeeFormData | null;
}

class RegistrationForm extends React.Component<
  Record<string, never>,
  RegistrationFormState
> {
  /**
   * ─── MOUNTING: constructor() ───────────────────────────
   * Called first. We initialise state here.
   * Lesson: "State is data maintained inside a component."
   */
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
    };
  }

  /**
   * ─── MOUNTING: componentDidMount() ─────────────────────
   * Runs once after the first render.
   * Good place for subscriptions, API calls, etc.
   */
  componentDidMount(): void {
    document.title = "Employee Registration";
  }

  /**
   * ─── UPDATING: shouldComponentUpdate() ─────────────────
   * Lesson: "shouldComponentUpdate() — called during the
   * updating phase."
   * Returning true means React will re-render.
   * We always return true here; in production you might
   * optimise by comparing prevState/nextState.
   */
  shouldComponentUpdate(
    _nextProps: Record<string, never>,
    nextState: RegistrationFormState
  ): boolean {
    // Example: skip re-render if nothing changed
    if (
      this.state.formData === nextState.formData &&
      this.state.errors === nextState.errors &&
      this.state.submitted === nextState.submitted
    ) {
      return false;
    }
    return true;
  }

  /**
   * ─── UPDATING: componentDidUpdate() ────────────────────
   * Lesson: "An update can be caused by changes to props or state."
   */
  componentDidUpdate(
    _prevProps: Record<string, never>,
    prevState: RegistrationFormState
  ): void {
    if (prevState.submitted !== this.state.submitted && this.state.submitted) {
    }
  }

  /**
   * ─── UNMOUNTING: componentWillUnmount() ────────────────
   * Lesson: "don't forget to unsubscribe in componentWillUnmount()."
   */
  componentWillUnmount(): void {
    document.title = "React App";
  }

  /**
   * Generic field updater.
   * Uses setState with a callback to safely merge into formData.
   * Lesson: "Always use setState."
   */
  handleFieldChange = (field: keyof EmployeeFormData) => (value: string) => {
    this.setState((prevState) => ({
      formData: { ...prevState.formData, [field]: value },
      errors: [], // clear errors on change
    }));
  };

  /**
   * Form validation using utility functions from /utils/.
   */
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

  /**
   * Handle form submission.
   */
  handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const errs = this.validate();

    if (errs.length > 0) {
      this.setState({ errors: errs });
      return;
    }

    // Successful submission
    this.setState({
      submitted: true,
      submittedData: { ...this.state.formData },
      errors: [],
    });
  };

  /**
   * Reset form to initial state.
   */
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
    });
  };

  /** Security question options */
  securityQuestionOptions = [
    { value: "What is your pet's name?", label: "What is your pet's name?" },
    {
      value: "What city were you born in?",
      label: "What city were you born in?",
    },
    {
      value: "What is your mother's maiden name?",
      label: "What is your mother's maiden name?",
    },
    {
      value: "What was the name of your first school?",
      label: "What was the name of your first school?",
    },
  ];

  /** Gender options */
  genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  /**
   * ─── MOUNTING / UPDATING: render() ─────────────────────
   * Lesson: "render() is called during both Mounting and
   * Updating phases."
   */
  render(): React.ReactNode {
    const { formData, errors, submitted, submittedData } = this.state;

    return (
      <div className="registration">
        <div className="registration__card">
          <h2 className="registration__title">Apply as a Employee</h2>

          {/* ── Error messages ── */}
          {errors.length > 0 && (
            <div className="registration__errors">
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {/* ── Success message ── */}
          {submitted && submittedData && (
            <div className="registration__success">
              <p>
                ✅ Registration successful! Welcome,{" "}
                <strong>{submittedData.firstName} {submittedData.lastName}</strong>
              </p>
              <button
                type="button"
                className="registration__reset-btn"
                onClick={this.handleReset}
              >
                Register Another
              </button>
            </div>
          )}

          {/* ── Form ── */}
          {!submitted && (
            <form onSubmit={this.handleSubmit} className="registration__form">
              {/* Row 1: First Name — Email */}
              <div className="registration__row">
                <InputField
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={this.handleFieldChange("firstName")}
                />
                <InputField
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={this.handleFieldChange("email")}
                />
              </div>

              {/* Row 2: Last Name — Phone */}
              <div className="registration__row">
                <InputField
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={this.handleFieldChange("lastName")}
                />
                <InputField
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={this.handleFieldChange("phone")}
                />
              </div>

              {/* Row 3: Password — Security Question */}
              <div className="registration__row">
                <InputField
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={this.handleFieldChange("password")}
                />
                <SelectField
                  name="securityQuestion"
                  placeholder="Please select your Security Question"
                  value={formData.securityQuestion}
                  onChange={(v: string) =>
                    this.handleFieldChange("securityQuestion")(
                      v as SecurityQuestion
                    )
                  }
                  options={this.securityQuestionOptions}
                />
              </div>

              {/* Row 4: Confirm Password — Security Answer */}
              <div className="registration__row">
                <InputField
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={this.handleFieldChange("confirmPassword")}
                />
                <InputField
                  type="text"
                  name="securityAnswer"
                  placeholder="Enter Your Answer"
                  value={formData.securityAnswer}
                  onChange={this.handleFieldChange("securityAnswer")}
                />
              </div>

              {/* Row 5: Gender radios — Register button */}
              <div className="registration__row registration__row--actions">
                <RadioGroup
                  name="gender"
                  value={formData.gender}
                  onChange={this.handleFieldChange("gender")}
                  options={this.genderOptions}
                />
                <button type="submit" className="registration__submit-btn">
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default RegistrationForm;
