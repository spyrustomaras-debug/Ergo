import React from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to register/login page after logout
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Top bar */}
      <header
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        >
        {/* Stylish logo/text */}
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

        {/* Logout button */}
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


      {/* Dashboard content */}
      <main style={{ padding: "2rem" }}>
        <h2>Welcome, {user?.username || "Worker"}!</h2>
        <p>This is your dashboard. You can put charts, stats, or other components here.</p>
      </main>
    </div>
  );
};

export default HomePage;
