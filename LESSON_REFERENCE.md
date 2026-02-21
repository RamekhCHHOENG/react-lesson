# 📚 Lesson Reference — React Components, Props, State & Lifecycle

> **Use this document to answer every "WHY?" question the teacher may ask during the demo.**

---

## 🗂️ 1. Project Folder Structure — WHY?

```
/src
  ├── /assets/        → Static files (images, fonts). Keeps binary files separate from code.
  ├── /components/    → Reusable UI pieces (InputField, SelectField, RadioGroup, Card, CardImage).
  ├── /features/      → Feature-specific modules. Keeps related logic together (feature-folder pattern).
  ├── /hooks/         → Custom React hooks (useFormField). Extracts reusable logic from components.
  ├── /layouts/       → Shared layout (MainLayout with header/footer). Pages swap inside the layout.
  ├── /pages/         → Page-level components mapped to routes (RegistrationForm).
  ├── /services/      → API calls (registerEmployee). Decouples network logic from UI.
  ├── /store/         → Global state management. Placeholder for Redux/Zustand/Context.
  ├── /styles/        → CSS files grouped by component. One file per component = easy to find.
  ├── /types/         → TypeScript interfaces & types. Single source of truth for data shapes.
  ├── /utils/         → Pure helper functions (validation). No side-effects, easy to test.
  ├── /config/        → App configuration, environment variables.
  ├── App.tsx         → Root component that assembles everything.
  ├── main.tsx        → Entry point — renders <App /> into the DOM.
  └── router.tsx      → React Router setup — maps URLs to pages.
```

**Teacher Q:** *"Why separate folders for components, pages, and layouts?"*
**Answer:** Separation of concerns. Components are *reusable building blocks*, pages are *route-level views*, and layouts are *shared wrappers* (header/footer). This structure scales well — when the app grows, each file is easy to locate.

---

## 🧩 2. Components — WHAT & WHY?

### What are components?
> "Components are the building blocks of any React app. Components let you split the UI into independent, reusable pieces."

### Two kinds:

| Kind | Also Called | Has State? | Our Examples |
|------|-----------|-----------|-------------|
| **Stateless** | Functional Component | ❌ No | `InputField`, `SelectField`, `RadioGroup`, `StatelessCard`, `CardImage`, `MainLayout` |
| **Stateful** | Class Component | ✅ Yes | `RegistrationForm`, `StatefulCard` |

**Teacher Q:** *"Why did you make InputField a functional/stateless component?"*
**Answer:** InputField doesn't own any data. Its `value` comes from the parent's state via props, and it reports changes back through `onChange`. It only *displays* and *notifies* — no internal state needed, so a stateless functional component is the simplest and most efficient choice.

**Teacher Q:** *"Why did you make RegistrationForm a class/stateful component?"*
**Answer:** The form owns all the field data (`firstName`, `email`, `password`, etc.) in its internal state. It also demonstrates the full component lifecycle (constructor, componentDidMount, shouldComponentUpdate, componentDidUpdate, componentWillUnmount), which are class-component features covered in the lesson.

---

## 📦 3. Props — WHAT & WHY?

> "Props are set by the parent and they are fixed throughout the lifetime of a component."

### How we use Props:

```
RegistrationForm (parent, owns the state)
  └── passes props to → InputField ({ type, placeholder, value, onChange, name })
  └── passes props to → SelectField ({ value, onChange, options, placeholder })
  └── passes props to → RadioGroup ({ name, value, onChange, options })
```

**Teacher Q:** *"Why pass value and onChange as props instead of letting InputField manage its own state?"*
**Answer:** This is the **Controlled Component** pattern. The parent (RegistrationForm) is the *single source of truth* for all form data. The child (InputField) just renders what it receives and reports user input back. This makes validation, submission, and state management much easier because all data lives in one place.

### PropTypes (Runtime Validation)

> "PropTypes exports a range of validators to make sure the data you receive is valid."

Every component has `propTypes` defined. Example from `InputField`:

```tsx
InputField.propTypes = {
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
};
```

**Teacher Q:** *"We already have TypeScript. Why also use PropTypes?"*
**Answer:** TypeScript checks types at *compile time* (when we build). PropTypes checks at *runtime* (in the browser console). If a parent accidentally passes a wrong type at runtime, PropTypes will show a warning. The lesson specifically mentions PropTypes, so we include both.

### Default Props

> "You can define default values for your props by assigning to the special defaultProps property."

```tsx
InputField.defaultProps = {
  required: true,
  type: "text",
};
```

**Teacher Q:** *"Why use defaultProps?"*
**Answer:** So the parent doesn't have to pass every prop every time. If `required` isn't specified, it defaults to `true`. This reduces boilerplate when calling the component.

---

## 🔄 4. State — WHAT & WHY?

> "State is data maintained inside a component. It is local or owned by that specific component. The component itself will update the state using the setState() function."

### Where State lives:

| Component | State Data | Why Here? |
|-----------|-----------|-----------|
| `RegistrationForm` | `formData`, `errors`, `submitted` | This component owns the form; no parent needs this data |
| `StatefulCard` | `renderCount`, `mountedAt` | Demonstrates that class components can track internal data |

### setState() Rules (from the lesson):

1. **Never mutate state directly:**
   ```tsx
   // ❌ DO NOT DO THIS
   this.state.count = this.state.count + 1;
   ```
   React can't detect direct mutations, so the component won't re-render.

2. **Always use setState:**
   ```tsx
   // ✅ CORRECT — use callback form with prevState
   this.setState((prevState) => ({
     renderCount: prevState.renderCount + 1,
   }));
   ```
   We use the *callback form* `(prevState) => ...` because it safely references the previous value (important when multiple setState calls queue up).

**Teacher Q:** *"Why use the callback form of setState instead of just passing an object?"*
**Answer:** Because setState is *asynchronous*. If we reference `this.state.count` directly, it might be stale. The callback `(prevState) => ...` always gives us the latest previous state.

---

## ⏳ 5. Component Lifecycle — WHAT & WHY?

### Mounting (component created → inserted into DOM)

| Method | Where We Use It | Why |
|--------|----------------|-----|
| `constructor()` | `RegistrationForm`, `StatefulCard` | Initialise state (`this.state = {...}`) before any render |
| `render()` | Both | Returns JSX — tells React what to display |
| `componentDidMount()` | Both | Runs once after first render. Perfect for API calls, subscriptions, setting `document.title` |

**Teacher Q:** *"Why do you set document.title in componentDidMount instead of constructor?"*
**Answer:** The constructor runs before the component is in the DOM. `componentDidMount` runs after — it's the right place for side-effects like DOM manipulation, API calls, or subscriptions.

### Updating (re-render caused by props or state change)

| Method | Where We Use It | Why |
|--------|----------------|-----|
| `shouldComponentUpdate()` | `RegistrationForm` | Optimisation: we can skip re-renders if nothing actually changed |
| `render()` | Both | Re-renders with new state/props |
| `componentDidUpdate()` | Both | Reacts to changes after re-render (e.g., log when form is submitted) |

**Teacher Q:** *"Why use shouldComponentUpdate?"*
**Answer:** Performance. By default React re-renders on every setState. `shouldComponentUpdate` lets us compare old vs new state and skip unnecessary renders. In our form, if formData and errors haven't changed, we return `false`.

### Unmounting (component removed from DOM)

| Method | Where We Use It | Why |
|--------|----------------|-----|
| `componentWillUnmount()` | Both | Clean up: clear timers, cancel subscriptions, reset document.title |

**Teacher Q:** *"Why do you need componentWillUnmount?"*
**Answer:** To prevent memory leaks. If we set up a timer, event listener, or subscription in `componentDidMount`, we must tear it down in `componentWillUnmount`. The lesson says: *"don't forget to unsubscribe in componentWillUnmount()."*

---

## ⚖️ 6. State vs Props

| | **State** | **Props** |
|---|-----------|-----------|
| Created by | The component itself | The parent component |
| Changeable? | ✅ Yes (via setState) | ❌ No (read-only) |
| Where? | `RegistrationForm.state.formData` | `InputField` receives `value`, `onChange` |
| Purpose | Component's own mutable data | Configuration passed from parent |

**Teacher Q:** *"What's the difference between State and Props?"*
**Answer (from lesson):**
- **State**: created in the component, is changeable.
- **Props**: created from parents, should not change.

In our app: `RegistrationForm` creates `formData` as *state*. It then passes `formData.firstName` down to `InputField` as a *prop*. InputField can't modify it — it can only call `onChange` to ask the parent to update its state.

---

## 🏋️ 7. Lesson Exercises — How We Fulfilled Them

### Exercise 1: Card with title + description as props (Stateless AND Stateful)
- **StatelessCard** (`/components/Card.tsx`) — Functional component, no state, receives `title` and `description` via props.
- **StatefulCard** (`/components/Card.tsx`) — Class component, has `renderCount` and `mountedAt` in state, also receives `title` and `description` via props. Demonstrates full lifecycle.

### Exercise 2: CardImage with imageUrl, title, description as props
- **CardImage** (`/components/CardImage.tsx`) — Stateless functional component. Receives `imageUrl`, `title`, `description` via props. Purely presentational.

### Exercise 3 (Main Exercise): Employee Registration Form
- **RegistrationForm** (`/pages/RegistrationForm.tsx`) — Stateful class component. Demonstrates state, setState, lifecycle, composition with child components via props, validation using utils.

---

## 🚀 8. How to Run

```bash
cd react-lesson
npm install
npm run dev
```

Open http://localhost:5173 in the browser.

**Open browser DevTools → Console** to see lifecycle logs:
- `[RegistrationForm] constructor()`
- `[RegistrationForm] componentDidMount()`
- `[RegistrationForm] shouldComponentUpdate()`
- `[RegistrationForm] componentDidUpdate()`
- `[StatefulCard] constructor()`
- etc.

---

## 📋 Quick Answer Cheat-Sheet

| Question | Answer |
|----------|--------|
| Why Vite? | Fast dev server, instant HMR, recommended by React team |
| Why TypeScript? | Catches type errors at compile time |
| Why PropTypes + TypeScript? | TS = compile-time, PropTypes = runtime warnings |
| Why Class Components? | To demonstrate lifecycle methods (lesson requirement) |
| Why Controlled Inputs? | Parent owns state = single source of truth |
| Why separate /utils/? | Pure functions, no side-effects, easy to test |
| Why /services/ for API? | Decouples network logic from UI components |
| Why /layouts/? | Shared UI (header/footer) wraps all pages |
| Why /types/? | Single source of truth for all data shapes |
| Why BrowserRouter? | Enables client-side navigation without page reload |
| Why callback form of setState? | Prevents stale state references (setState is async) |
| Why componentDidMount for side-effects? | Runs after DOM is ready; constructor is too early |
| Why componentWillUnmount? | Prevents memory leaks from subscriptions/timers |
