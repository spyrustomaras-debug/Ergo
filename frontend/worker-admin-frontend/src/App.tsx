import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './api/ProtectedRoute';
import { Suspense, lazy } from 'react';
import { Loader } from './utils/Loader';

// lazy load LoginPage
const LoginPage = lazy(() => import("../src/pages/LoginPage"));
const HomePage = lazy(() => import("../src/pages/HomePage"));
const RegisterPage = lazy(() => import("../src/pages/Register"));

const App = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element=
          {
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
          } />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
