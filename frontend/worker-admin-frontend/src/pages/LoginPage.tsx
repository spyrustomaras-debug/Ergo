import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/axios";

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user, loggedIn, accessToken } = useAppSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) {
      dispatch({ type: "auth/clearError" }); // dispatch a reducer to reset error
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(form));
  };

  // Attach token to Axios and navigate after login
  useEffect(() => {
    if (user && accessToken) {
      setAuthToken(accessToken);
      navigate("/home");
    }
  }, [user, accessToken, navigate]);

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
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
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
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {!loading && !loggedIn && error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {typeof error === "string"
              ? error
              : "detail" in error
              ? error.detail
              : "Login failed"}
          </p>
        )}


        {/* Link to register page */}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don't have an account?{" "}
          <Link to="/" style={{ color: "#4CAF50", textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
