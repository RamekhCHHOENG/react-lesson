/**
 * ============================================================
 * Main Entry Point — /index.tsx
 * ============================================================
 * Teacher's structure: /index.tsx — "Main entry point for React"
 *
 * This file bootstraps the React app by rendering <App />
 * into the DOM root element defined in index.html.
 * ============================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
