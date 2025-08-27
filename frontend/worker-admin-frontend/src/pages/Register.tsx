import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { registerWorker } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // <-- useNavigate hook
  const { loading, error, user } = useAppSelector(state => state.auth);

  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerWorker(form));
  };

  // Redirect after successful registration
  useEffect(() => {
    if (user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minWidth: "300px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Register Worker</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>



        {/* Link to login page */}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account? <Link to="/login" style={{ color: "#4CAF50", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
