import React, { useState } from "react";
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
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to login/register
  };

  const handleWarning = () => {
    setShowWarning(true);
  };

  // Auto-logout after 1 minute inactivity, show warning 5 seconds before
  useIdleTimer({
    timeout: 60000,        // 1 minute
    warningTime: 5000,      // show warning 5 seconds before logout
    onIdle: handleLogout,
    onWarning: handleWarning,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
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

        {error && <p style={{ color: "red" }}>{typeof error === "string" ? error : JSON.stringify(error)}</p>}

        {role === "ADMIN" ? <AdminDashboard /> : <ProjectDashboard />}
      </main>

      {/* Warning Modal */}
      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h2>Warning!</h2>
            <p>You will be logged out in 5 seconds due to inactivity.</p>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Continue Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
