import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "../components/ProjectDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { useIdleTimer } from "../hooks/useIdleTimer";


const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, role, error } = useAppSelector(state => state.auth);
  const [wsConnected, setWsConnected] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to login/register
  };

  // Auto-logout after 1 minute (60000 ms) of inactivity
  useIdleTimer({
    timeout: 60 * 1000, // 1 minute
    onIdle: handleLogout,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Top bar */}
      <header
        style={{
          position: "sticky",     // or "fixed" if you want it always visible
          top: 0,                 // stick to the top
          zIndex: 1000,           // make sure it’s above other content
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#4CAF50",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          Ergo
        </h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: "2rem" }}>
        <h2>Welcome, {user?.username || "Worker"}!</h2>

        {/* Display error safely */}
        {error && (
          <p style={{ color: "red" }}>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </p>
        )}

        {/* Render dashboard based on role */}
        {role === "ADMIN" ? <AdminDashboard /> : <ProjectDashboard />}
      </main>
    </div>
  );
};

export default HomePage;
