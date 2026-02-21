# 🤖 GitHub Copilot Instructions — React Lesson Project


Your are senior and engineer developer 30 years experience working on a React + TypeScript and all programming project educational project. This file contains instructions for GitHub Copilot to understand the project context, architecture, coding conventions, and patterns so it can generate accurate and consistent code when you ask it to create new files or components.

you should follow these instructions when generating new code, ensuring that all new files adhere to the project structure and coding standards outlined here. This will help maintain a clean, organized codebase that is easy to understand and extend as the lesson progresses.

you good at ux/ui design. 

> These instructions help GitHub Copilot understand the project context, coding conventions, and architecture so it can generate accurate, consistent code.

---

## 📌 Project Overview

This is a **React + TypeScript educational project** used for teaching React concepts including:

- **Components** (Stateless functional & Stateful class components)
- **Props** (parent → child data flow, controlled components)
- **State** (class component state, `useState`, `useReducer`)
- **Lifecycle Methods** (constructor, componentDidMount, shouldComponentUpdate, componentDidUpdate, componentWillUnmount)
- **Custom Hooks** (extracting reusable logic)
- **React Router** (URL-based navigation)
- **Context API + useReducer** (global state management)
- **PropTypes** (runtime validation alongside TypeScript)

The project has **two sub-projects**:

1. **`/project`** — Main lesson app (forms, registration, employee CRUD)
2. **`/project-management`** — Extended project management app (projects + tasks with CRUD)

---

## 🛠️ Tech Stack

| Technology          | Version / Details                          |
| ------------------- | ------------------------------------------ |
| React               | 19.x                                       |
| TypeScript           | 5.9.x (strict mode)                       |
| Vite                | 7.x (build tool + dev server)             |
| React Router DOM    | 7.x (client-side routing)                 |
| TanStack React Query| 5.x (server state management — available) |
| Tailwind CSS        | Used in project-management + UI components |
| Radix UI            | Primitives for Dialog, Slot, etc.          |
| Lucide React        | Icon library                               |
| PropTypes           | Runtime prop validation (lesson requirement)|
| shadcn/ui           | UI component library (in `components/ui/`) |
| class-variance-authority | Component variant styling              |
| tailwind-merge      | Tailwind class merging utility             |

---

## 📂 Folder Structure Convention

Always follow this folder organization for the `/project/src/` directory:

```
src/
├── assets/        → Static files (images, fonts)
├── components/    → Reusable UI components (InputField, SelectField, Card, etc.)
│   └── ui/        → shadcn/ui base components (button, input, dialog, etc.)
├── config/        → App configuration & constants
├── features/      → Feature-specific modules (e.g., features/projects/)
│   └── projects/  → Project management feature components
├── hooks/         → Custom React hooks (useFormField, useProjects)
├── layouts/       → Layout wrappers (MainLayout with header/footer/nav)
├── lib/           → Third-party utility wrappers (cn() from shadcn)
├── pages/         → Page-level components mapped to routes
├── services/      → API calls, localStorage services, external integrations
├── store/         → Global state (Context + useReducer pattern)
├── styles/        → CSS files (one per component: Component.css)
├── types/         → TypeScript interfaces & types (one file per domain)
├── utils/         → Pure helper/utility functions (validation, formatting)
├── App.tsx        → Root component (renders Router)
├── main.tsx       → Entry point (renders <App /> into DOM)
└── router.tsx     → React Router setup (maps URLs → pages)
```

---

## 📏 Coding Conventions & Rules

### General

- **Language**: Always use **TypeScript** (`.ts` / `.tsx`), never plain JavaScript.
- **Path aliases**: Use `@/` alias for imports from `src/` (e.g., `import { Button } from "@/components/ui/button"`).
- **Exports**: Use **barrel files** (`index.ts`) in each folder for clean imports.
- **Comments**: Include JSDoc-style header comments explaining **WHY** a file exists and which lesson concept it demonstrates.

### Components

- **Functional components**: Use `React.FC<Props>` type annotation.
- **Class components**: Use `React.Component<Props, State>` with proper type generics (used to teach lifecycle methods).
- **Props interface**: Define in `types/` folder, name as `{ComponentName}Props`.
- **Controlled components**: Parent owns the state, child receives `value` + `onChange` via props.
- **PropTypes**: Add runtime PropTypes validation alongside TypeScript types (lesson requirement).
- **Default props**: Use destructuring defaults in function signature (e.g., `required = true`).

### State Management

- **Local state**: Use `this.state` in class components or `useState` in functional components.
- **Global state**: Use **React Context + useReducer** pattern (see `store/ProjectContext.tsx` + `store/projectReducer.ts`).
- **Actions**: Define action types as discriminated unions (e.g., `type ProjectAction = { type: "CREATE_PROJECT"; payload: ProjectFormData } | ...`).
- **Persistence**: Use `localStorage` via service layer (`services/projectStorage.ts`).

### Hooks

- **Custom hooks**: Prefix with `use` (e.g., `useFormField`, `useProjects`).
- **Location**: Place in `hooks/` folder.
- **Pattern**: Return an object with values and handlers (e.g., `{ value, onChange, reset }`).

### Routing

- **Router**: Uses `BrowserRouter` + `Routes` + `Route` from `react-router-dom`.
- **Navigation**: Use `<Link>` component for internal navigation, never `<a>` tags.
- **Route definition**: All routes defined in `router.tsx`.

### Styling

- **CSS files**: One CSS file per component in `styles/` folder (e.g., `styles/CreateEmployee.css`).
- **BEM naming**: Use BEM-like class naming (e.g., `layout__header`, `layout__link--fancy`).
- **Tailwind**: Used in `project-management` sub-project and `components/ui/` (shadcn).
- **`cn()` utility**: Use `cn()` from `@/lib/utils` for conditional Tailwind class merging.

### Types

- **Location**: Define all interfaces/types in `types/` folder.
- **Naming**: Use `PascalCase` for interfaces and types.
- **Domain files**: Separate by domain (e.g., `employee.ts`, `register.ts`, `project.ts`).
- **Export**: Re-export from `types/index.ts` barrel file.

### Services

- **API layer**: All API/backend calls go in `services/` (e.g., `services/api.ts`).
- **Storage layer**: localStorage operations in `services/projectStorage.ts`.
- **Mock-first**: Currently uses mock data / localStorage. Code should be structured so swapping to a real API requires minimal changes.

### Config

- **App config**: Centralized in `config/` (e.g., `config/project.ts`).
- **Use `as const`**: For config objects to get literal types.
- **Status/Priority maps**: Define label + color mappings in config (e.g., `PROJECT_STATUS_CONFIG`).

---

## 🧩 Key Patterns to Follow

### 1. Controlled Form Pattern
```tsx
// Parent owns state, child receives value + onChange
<InputField
  type="text"
  name="firstName"
  placeholder="e.g. John"
  value={formData.firstName}           // from parent state
  onChange={handleFieldChange("firstName")} // callback to parent
/>
```

### 2. Context + Reducer Pattern
```tsx
// store/ProjectContext.tsx
const [state, dispatch] = useReducer(projectReducer, initialProjectState);
// Usage in components:
const { state, dispatch } = useProjectContext();
dispatch({ type: "CREATE_PROJECT", payload: formData });
```

### 3. Barrel Export Pattern
```tsx
// components/index.ts
export { default as InputField } from "./InputField";
export { default as SelectField } from "./SelectField";
// Usage:
import { InputField, SelectField } from "@/components";
```

### 4. Service Layer Pattern
```tsx
// services/api.ts — mock API that can be swapped later
export async function registerEmployee(data: EmployeeFormData): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, message: "Done!" }), 800);
  });
}
```

---

## ⚠️ Important Rules

1. **Never put business logic directly in components** — extract to `utils/`, `hooks/`, or `services/`.
2. **Never use `any` type** — always define proper TypeScript interfaces.
3. **Never use inline styles** — use CSS files (BEM) or Tailwind utility classes.
4. **Always validate props** with both TypeScript interfaces AND PropTypes (lesson requirement).
5. **Always use `@/` path alias** — never use relative paths like `../../components`.
6. **Always add header comments** on new files explaining the purpose and which lesson concept applies.
7. **Keep components small** — if a component exceeds ~150 lines, break it into sub-components.
8. **Forms must be controlled** — parent component always owns the form state.
9. **Use discriminated unions** for reducer action types.
10. **Export from barrel files** — update `index.ts` when adding new modules.

---

## 🔧 Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

---

## 📝 When Creating New Files

When Copilot generates a new file, always include:

1. **Header comment block** with:
   - File purpose
   - Which folder convention it follows
   - Which React lesson concept it demonstrates
2. **TypeScript interface** for all props/state
3. **PropTypes** validation (for components)
4. **Export** from the relevant `index.ts` barrel file
5. **Proper imports** using `@/` alias

### Example New Component Template:
```tsx
/**
 * ============================================================
 * ComponentName — Description
 * ============================================================
 * Folder: /components/ — "Reusable UI components"
 *
 * LESSON CONCEPT:
 *   ✅ Props → receives data from parent
 *   ✅ Controlled Component → value + onChange pattern
 * ============================================================
 */

import React from "react";
import PropTypes from "prop-types";
import type { ComponentNameProps } from "@/types";

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func.isRequired,
};

export default ComponentName;
```
