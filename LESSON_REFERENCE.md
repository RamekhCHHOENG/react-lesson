# 📚 Lesson Reference — React Components, Props, State & Lifecycle

> **This document explains every decision in the code with actual code snippets.**
> Use it to answer any "WHY?" question the teacher asks during demo.

---

## 🗂️ 1. Folder Structure — WHY This Organization?

```
src/
  ├── assets/        → Static files (images, fonts)
  ├── components/    → Reusable UI components (InputField, SelectField, RadioGroup, Card, CardImage)
  ├── config/        → Environment variables and app configuration
  ├── features/      → Feature-specific modules (placeholder for future growth)
  ├── hooks/         → Custom React hooks (useFormField)
  ├── layouts/       → Shared layout wrappers (MainLayout with header, footer, nav)
  ├── pages/         → Page-level components mapped to routes (RegistrationForm, CreateEmployee)
  ├── services/      → API calls — decouples network logic from UI
  ├── store/         → Global state management (placeholder for Redux/Zustand/Context)
  ├── styles/        → CSS files — one per component
  ├── types/         → TypeScript interfaces & types
  ├── utils/         → Pure helper functions (validation)
  ├── App.tsx        → Root component
  ├── main.tsx       → Entry point — renders <App /> into the DOM
  └── router.tsx     → React Router setup — maps URLs to pages
```

**Q: Why separate folders for components, pages, and layouts?**

> Separation of concerns. Components are **reusable building blocks** (used in multiple pages). Pages are **route-level views** (one per URL). Layouts are **shared wrappers** (header/footer stay the same while page content swaps). This structure scales well.

---

## 🧩 2. Components — Stateless vs Stateful

### Lesson Theory:
> "There are 2 main kinds of components: **Stateless** and **Stateful** Component."
> - Stateless Component (Functional Component): have no state.
> - Stateful Component (Class Component): can hold state.

### What We Built:

| Component | Type | File | Why This Type? |
|-----------|------|------|---------------|
| `InputField` | **Stateless** (Functional) | `components/InputField.tsx` | Only displays a value from props and reports changes — no own data |
| `SelectField` | **Stateless** (Functional) | `components/SelectField.tsx` | Same — renders options from props, reports selection |
| `RadioGroup` | **Stateless** (Functional) | `components/RadioGroup.tsx` | Same — renders radio buttons from props |
| `StatelessCard` | **Stateless** (Functional) | `components/Card.tsx` | Lesson Exercise 1 — displays title + description |
| `CardImage` | **Stateless** (Functional) | `components/CardImage.tsx` | Lesson Exercise 2 — displays imageUrl, title, description |
| `StatefulCard` | **Stateful** (Class) | `components/Card.tsx` | Lesson Exercise 1 — same props but also tracks click count in state |
| `RegistrationForm` | **Stateful** (Class) | `pages/RegistrationForm.tsx` | Owns all form data in state, demonstrates lifecycle |
| `CreateEmployee` | **Stateful** (Class) | `pages/CreateEmployee.tsx` | Same logic, fancy UI — reuses same child components |

### Code: Stateless Component (InputField)

```tsx
// components/InputField.tsx
const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,       // ← comes from parent's STATE, passed as PROP
  onChange,    // ← callback to parent, passed as PROP
  required = true,  // ← default prop value
  name,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={`${placeholder}${required ? " *" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  );
};
```

**Q: Why is InputField a functional/stateless component?**

> It doesn't own any data. Its `value` comes from the parent's state via props, and it reports changes back through `onChange`. It only **displays** and **notifies** — no internal state needed. A stateless functional component is the simplest choice.

### Code: Stateful Component (RegistrationForm / CreateEmployee)

```tsx
// pages/CreateEmployee.tsx (same pattern in RegistrationForm.tsx)
class CreateEmployee extends React.Component<{}, CreateEmployeeState> {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        firstName: "",
        lastName: "",
        // ... all form fields
      },
      errors: [],
      submitted: false,
    };
  }
  // ...
}
```

**Q: Why is the form a class/stateful component?**

> The form **owns** all the field data (firstName, email, password, etc.) in its internal state. It also needs to demonstrate the **full component lifecycle** (constructor, componentDidMount, shouldComponentUpdate, componentDidUpdate, componentWillUnmount), which are class-component features covered in the lesson.

---

## 📦 3. Props — Data Passed from Parent to Child

### Lesson Theory:
> "Props are set by the parent and they are fixed throughout the lifetime of a component."
> "Most components can be customized when they are created, with different parameters. These creation parameters are called props."

### How Props Flow in Our App:

```
CreateEmployee (PARENT — owns the state)
  │
  ├── passes props to → InputField ({ type, placeholder, value, onChange, name })
  ├── passes props to → SelectField ({ value, onChange, options, placeholder })
  └── passes props to → RadioGroup ({ name, value, onChange, options })
```

### Code: Parent Passing Props to Child

```tsx
// In CreateEmployee.tsx render():
<InputField
  type="text"              // ← prop: what kind of input
  name="firstName"         // ← prop: HTML name attribute
  placeholder="e.g. John"  // ← prop: placeholder text
  value={formData.firstName}  // ← prop: comes from this component's STATE
  onChange={this.handleFieldChange("firstName")}  // ← prop: callback function
/>
```

**Q: Why pass `value` and `onChange` as props instead of letting InputField manage its own state?**

> This is the **Controlled Component** pattern. The parent (CreateEmployee) is the **single source of truth** for all form data. The child (InputField) just renders what it receives and reports user input back. This makes validation, submission, and state management much easier because all data lives in one place.

### Code: Defining Props with TypeScript Types

```tsx
// types/employee.ts
export interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;   // ← optional prop (has default)
  name: string;
}
```

**Q: Why define types in a separate `/types/` folder?**

> Single source of truth. If multiple components use the same data shape (like `EmployeeFormData`), defining it once in `/types/` prevents duplication and keeps all component contracts in one place.

---

## 🛡️ 4. PropTypes — Runtime Validation

### Lesson Theory:
> "PropTypes exports a range of validators that can be used to make sure the data you receive is valid."
> "propTypes is only checked in development mode."

### Code: PropTypes on InputField

```tsx
// components/InputField.tsx
import PropTypes from "prop-types";

InputField.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
};
```

**Q: We already have TypeScript. Why also use PropTypes?**

> TypeScript checks types at **compile time** (when we build). PropTypes checks at **runtime** (in the browser console). If a parent accidentally passes a wrong type at runtime, PropTypes will show a warning. The lesson specifically requires PropTypes.

### Code: Default Props

```tsx
// In the function signature (modern approach):
const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  required = true,   // ← DEFAULT VALUE: if parent doesn't pass it, defaults to true
  name,
}) => { ... };
```

> Lesson: "You can define default values for your props." So parent doesn't have to pass every prop every time.

---

## 🔄 5. State — Data Owned by the Component

### Lesson Theory:
> "State is data maintained inside a component. It is local or owned by that specific component. The component itself will update the state using the setState() function."

### Code: Initialising State in constructor()

```tsx
// pages/CreateEmployee.tsx
constructor(props) {
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
```

**Q: Why does the form data live in state?**

> Because form data **changes** when the user types. State is for data that is "local or owned by that specific component" and is **changeable**. No parent or sibling needs to own this data.

### Code: Updating State with setState()

```tsx
// pages/CreateEmployee.tsx
handleFieldChange = (field: keyof EmployeeFormData) => (value: string) => {
  console.log(`[CreateEmployee] Field changed: ${field} =`, value);
  this.setState((prevState) => ({
    formData: { ...prevState.formData, [field]: value },
    errors: [],
  }));
};
```

### ⚠️ setState Rules (from the lesson):

**Rule 1: Never mutate state directly**
```tsx
// ❌ DO NOT DO THIS — React won't re-render!
this.state.formData.firstName = "John";
```

**Rule 2: Always use setState()**
```tsx
// ✅ CORRECT
this.setState((prevState) => ({
  formData: { ...prevState.formData, firstName: "John" },
}));
```

**Q: Why use the callback form `(prevState) => ...` instead of passing an object?**

> Because `setState` is **asynchronous**. If we reference `this.state` directly, it might be stale (React may batch multiple setState calls). The callback `(prevState) => ...` always gives us the latest previous state.

---

## ⏳ 6. Component Lifecycle — Mounting, Updating, Unmounting

### Lesson Theory:
> **Mounting:** constructor() → static getDerivedStateFromProps() → render() → componentDidMount()
> **Updating:** static getDerivedStateFromProps() → shouldComponentUpdate() → render() → getSnapshotBeforeUpdate() → componentDidUpdate()
> **Unmounting:** componentWillUnmount()

### Code: Full Lifecycle in CreateEmployee

#### 🟢 MOUNTING: constructor()
```tsx
constructor(props) {
  super(props);
  this.state = { formData: { ... }, errors: [], submitted: false };
  console.log("[CreateEmployee] constructor() — state initialised");
}
```
> **Called first** when the component is being created. We initialise state here — before any rendering.

#### 🟢 MOUNTING: componentDidMount()
```tsx
componentDidMount(): void {
  console.log("[CreateEmployee] componentDidMount() — component is in the DOM");
  document.title = "Create Employee — Premium";
}
```
> **Called once after first render.** The component is now in the DOM. This is the right place for **side-effects**: API calls, subscriptions, DOM manipulation.

**Q: Why set document.title in componentDidMount instead of constructor?**

> The constructor runs **before** the component is in the DOM. `componentDidMount` runs **after** — it's the right place for side-effects like DOM manipulation or API calls.

#### 🟡 UPDATING: shouldComponentUpdate()
```tsx
shouldComponentUpdate(_nextProps, nextState): boolean {
  console.log("[CreateEmployee] shouldComponentUpdate()");
  if (
    this.state.formData === nextState.formData &&
    this.state.errors === nextState.errors &&
    this.state.submitted === nextState.submitted
  ) {
    return false;  // ← Skip re-render, nothing changed
  }
  return true;
}
```
> **Performance optimisation.** By default React re-renders on every setState. We compare old vs new state and skip unnecessary renders by returning `false`.

#### 🟡 UPDATING: componentDidUpdate()
```tsx
componentDidUpdate(_prevProps, prevState): void {
  if (prevState.submitted !== this.state.submitted && this.state.submitted) {
    console.log("[CreateEmployee] componentDidUpdate() — form was submitted!");
  }
}
```
> **Called after every re-render.** We use it to react to state changes — e.g., log when the form transitions to "submitted".

#### 🔴 UNMOUNTING: componentWillUnmount()
```tsx
componentWillUnmount(): void {
  console.log("[CreateEmployee] componentWillUnmount() — cleaning up");
  document.title = "React App";
}
```
> **Called when the component is removed from the DOM.** We clean up side-effects (reset document.title). If we had timers or subscriptions from componentDidMount, we'd clear them here.

**Q: Why do we need componentWillUnmount?**

> To **prevent memory leaks**. Lesson: *"don't forget to unsubscribe in componentWillUnmount()."* If we set up a timer, event listener, or subscription in componentDidMount, we must tear it down here.

---

## ⚖️ 7. State vs Props — The Key Difference

### Lesson Theory:
> **State:** created in the component, is changeable.
> **Props:** created from parents, should not change.

### In Our Code:

```
CreateEmployee (STATEFUL — owns formData in STATE)
  │
  │  this.state.formData.firstName = "John"   ← STATE (changeable)
  │
  └── <InputField value={formData.firstName} />  ← PROP (read-only for InputField)
```

| | **State** | **Props** |
|---|-----------|-----------|
| Where created | `CreateEmployee` constructor | `CreateEmployee` passes to `InputField` |
| Changeable? | ✅ Yes — via `setState()` | ❌ No — read-only for the child |
| Example | `this.state.formData.firstName` | `<InputField value={formData.firstName} />` |

**Q: What happens when the user types in the input?**

1. User types → `InputField` fires `onChange(newValue)` (prop callback)
2. `CreateEmployee.handleFieldChange` runs → calls `this.setState(...)` (state update)
3. React re-renders `CreateEmployee` → passes new `value` prop to `InputField`
4. `InputField` displays the new value

> The child **never** changes the value directly. It asks the parent to update state, and the parent passes the new value back down as a prop. This is **one-way data flow**.

---

## 🏋️ 8. Lesson Exercises — How We Fulfilled Them

### Exercise 1: Card with title + description (Stateless AND Stateful)

```tsx
// Stateless Card — components/Card.tsx
export const StatelessCard: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

// Stateful Card — same file
export class StatefulCard extends React.Component<CardProps, StatefulCardState> {
  constructor(props) {
    super(props);
    this.state = { renderCount: 0, mountedAt: "" };
  }
  componentDidMount() {
    this.setState({ mountedAt: new Date().toLocaleTimeString() });
  }
  handleClick = () => {
    this.setState((prevState) => ({ renderCount: prevState.renderCount + 1 }));
  };
  render() {
    return (
      <div className="card">
        <h3>{this.props.title}</h3>
        <p>{this.props.description}</p>
        <p>Clicks: {this.state.renderCount}</p>
        <button onClick={this.handleClick}>Click me</button>
      </div>
    );
  }
}
```

### Exercise 2: CardImage with imageUrl, title, description

```tsx
// components/CardImage.tsx
const CardImage: React.FC<CardImageProps> = ({ imageUrl, title, description }) => {
  return (
    <div className="card">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### Exercise 3: Employee Registration Form (Main Exercise)

Two versions:
- **`/`** — Basic form (`RegistrationForm.tsx`) — matches the exercise screenshot exactly
- **`/create-employee`** — Fancy form (`CreateEmployee.tsx`) — same logic, premium glassmorphism UI

Both demonstrate: State, setState, Props, PropTypes, lifecycle methods, composition.

---

## 🎨 9. Two Routes — WHY Two Versions?

| Route | Page | UI Style |
|-------|------|----------|
| `/` | `RegistrationForm` | Simple — matches exercise screenshot |
| `/create-employee` | `CreateEmployee` | Premium glassmorphism + progress bar + animations |

**Q: Why two versions?**

> Both use the **exact same components** (InputField, SelectField, RadioGroup) and the **same lesson concepts**. This proves that components are truly reusable — the same building blocks produce completely different-looking UIs depending on styling and layout.

### Code: Router Setup

```tsx
// router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RegistrationForm, CreateEmployee } from "./pages";

<BrowserRouter>
  <MainLayout>
    <Routes>
      <Route path="/" element={<RegistrationForm />} />
      <Route path="/create-employee" element={<CreateEmployee />} />
    </Routes>
  </MainLayout>
</BrowserRouter>
```

**Q: Why use React Router?**

> Client-side navigation — the page doesn't reload when switching between `/` and `/create-employee`. The Layout stays constant while only the page content swaps.

---

## 🔧 10. Utils — Pure Helper Functions

```tsx
// utils/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function doPasswordsMatch(password: string, confirm: string): boolean {
  return password === confirm;
}
```

**Q: Why put validation in `/utils/` instead of inside the component?**

> Pure functions with no side-effects are easy to test and reuse. Both `RegistrationForm` and `CreateEmployee` import the same validation functions — no code duplication.

---

## 🚀 11. How to Run

```bash
cd react-lesson
npm install
npm run dev          # Development server at http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

**Open browser DevTools → Console** to see lifecycle logs:
```
[CreateEmployee] constructor() — state initialised
[CreateEmployee] componentDidMount() — component is in the DOM
[CreateEmployee] shouldComponentUpdate()
[CreateEmployee] Field changed: firstName = John
[CreateEmployee] componentDidUpdate() — form was submitted!
```

Navigate between pages to see `componentWillUnmount()` fire.

---

## 📋 12. Quick Answer Cheat-Sheet

| Question | Answer |
|----------|--------|
| Why Vite? | Fast dev server with instant HMR, recommended by React team |
| Why TypeScript? | Catches type errors at compile time |
| Why PropTypes + TypeScript? | TS = compile-time, PropTypes = runtime warnings |
| Why Class Components? | To demonstrate lifecycle methods (lesson requirement) |
| Why Functional Components for inputs? | They have no state — only display props |
| Why Controlled Inputs? | Parent owns state = single source of truth |
| Why callback form of setState? | Prevents stale state (setState is async) |
| Why componentDidMount for side-effects? | Runs after DOM is ready; constructor is too early |
| Why componentWillUnmount? | Prevents memory leaks from subscriptions/timers |
| Why shouldComponentUpdate? | Performance — skip re-render if nothing changed |
| Why `/utils/` for validation? | Pure functions, no side-effects, easy to test + reuse |
| Why `/types/` folder? | Single source of truth for data shapes |
| Why `/layouts/`? | Shared header/footer wraps all pages |
| Why React Router? | Client-side navigation without page reload |
| Why two form pages? | Proves components are reusable — same parts, different UI |
| State vs Props? | State = owned by component, changeable. Props = from parent, read-only |
