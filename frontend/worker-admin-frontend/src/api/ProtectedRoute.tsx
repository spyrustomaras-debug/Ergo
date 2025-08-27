import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../features/auth/hooks';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);

  // If no user, redirect to register page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
