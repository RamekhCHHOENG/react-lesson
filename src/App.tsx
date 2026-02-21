/**
 * ============================================================
 * App — App Component (Entry Point)
 * ============================================================
 * Teacher's structure: /app.tsx — "App component (entry point)"
 *
 * This is the root component. It renders the Router which
 * in turn renders Layout → Pages → Components.
 * ============================================================
 */

import AppRouter from "./router";
import "./styles/global.css";
import "./styles/Layout.css";

const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
