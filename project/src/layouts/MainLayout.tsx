/**
 * ============================================================
 * MainLayout — Layout Component
 * ============================================================
 * Teacher's structure: /layouts/ — "Layout components
 * (e.g., Header, Footer, Sidebar)"
 *
 * LESSON CONCEPT APPLIED:
 *   ✅ Props → children (Composition)
 *   ✅ Requiring Single Child:
 *      "With PropTypes.element you can specify that only a
 *       single child can be passed to a component as children."
 *
 * WHY a Layout component?
 *   Layouts wrap pages with shared UI (header, footer).
 *   When using React Router, the layout stays constant while
 *   the page content changes — good separation of concerns.
 * ============================================================
 */

import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      {/* Header */}
      <header className="layout__header">
        <h1 className="layout__logo">
          <span className="layout__logo--red">Exercise</span>
        </h1>
        <nav className="layout__nav">
          <Link to="/" className="layout__link">Basic Form</Link>
          <Link to="/register" className="layout__link">📝 Register (Old)</Link>
          <Link to="/new-register" className="layout__link layout__link--fancy">🧩 Register (Components)</Link>
        </nav>
      </header>

      {/* Page Content */}
      <main className="layout__main">{children}</main>

      {/* Footer */}
      <footer className="layout__footer">
      </footer>
    </div>
  );
};

MainLayout.propTypes = {
  /** Lesson: Requiring Single Child — PropTypes.element */
  children: PropTypes.node.isRequired,
};

export default MainLayout;
