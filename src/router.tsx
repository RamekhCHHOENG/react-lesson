/**
 * ============================================================
 * Router — React Router Setup
 * ============================================================
 * Teacher's structure: /router.tsx — "Routing (React Router setup)"
 *
 * WHY?
 *   React Router maps URL paths to page components.
 *   Keeping routes in one file makes navigation easy to manage.
 * ============================================================
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts";
import { RegistrationForm, CreateEmployee, Register } from "./pages";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/create-employee" element={<CreateEmployee />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
