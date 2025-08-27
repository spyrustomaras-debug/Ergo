import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import LoginPage from '../src/pages/LoginPage';
import RegisterPage from '../src/pages/Register';
import ProtectedRoute from './api/ProtectedRoute';

const App = () => {
  return (
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
  );
};

export default App;
