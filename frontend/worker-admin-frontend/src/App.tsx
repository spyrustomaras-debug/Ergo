import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./api/ProtectedRoute";
import { Loader } from "./utils/Loader";
import NotFoundPage from "./pages/NotFoundPage";

// Lazy load pages
const LoginPage = lazy(() => import("../src/pages/LoginPage"));
const RegisterPage = lazy(() => import("../src/pages/Register"));
const HomePage = lazy(() => import("../src/pages/HomePage"));

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Redirect root "/" to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
