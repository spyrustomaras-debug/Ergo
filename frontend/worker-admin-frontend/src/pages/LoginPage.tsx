import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const translations = {
  en: {
    login: "Login",
    username: "Username",
    password: "Password",
    show: "Show",
    hide: "Hide",
    noAccount: "Don't have an account?",
    register: "Register",
    loading: "Loading...",
    error: "Login failed"
  },
  gr: {
    login: "Σύνδεση",
    username: "Όνομα χρήστη",
    password: "Κωδικός",
    show: "Εμφάνιση",
    hide: "Απόκρυψη",
    noAccount: "Δεν έχετε λογαριασμό;",
    register: "Εγγραφή",
    loading: "Φόρτωση...",
    error: "Αποτυχία σύνδεσης"
  }
};

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user, accessToken } = useAppSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<"en" | "gr">("en");
  const t = translations[language];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(form));
  };

  useEffect(() => {
    if (user && accessToken) {
      setAuthToken(accessToken);
      navigate("/home");
    }
  }, [user, accessToken, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" }}>
      <div style={{ padding: "2rem", borderRadius: "8px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "300px" }}>

        {/* Language switcher */}
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button onClick={() => setLanguage("en")} disabled={language === "en"}>EN</button>
          <button onClick={() => setLanguage("gr")} disabled={language === "gr"} style={{ marginLeft: "0.5rem" }}>GR</button>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>{t.login}</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <input
            name="username"
            placeholder={t.username}
            value={form.username}
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t.password}
            value={form.password}
            onChange={handleChange}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: "0.4rem 0.6rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f0f0f0", cursor: "pointer" }}>
            {showPassword ? t.hide : t.show}
          </button>
          <button
            type="submit"
            disabled={loading || !form.username.trim() || !form.password.trim()}
            style={{ padding: "0.6rem", borderRadius: "4px", border: "none", backgroundColor: loading || !form.username.trim() || !form.password.trim() ? "#ccc" : "#4CAF50", color: "#fff", cursor: "pointer" }}
          >
            {loading ? t.loading : t.login}
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {typeof error === "string" ? error : "detail" in error ? error.detail : t.error}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          {t.noAccount}{" "}
          <Link to="/register" style={{ color: "#4CAF50", textDecoration: "none" }}>
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
