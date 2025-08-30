import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { registerWorker } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Validation schema using Yup
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector((state) => state.auth);

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
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Register Worker
        </h2>

        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              await dispatch(registerWorker(values)).unwrap();
              // Success handled by useEffect redirect
            } catch (err: any) {
              // Map backend validation errors to Formik fields
              if (err) {
                setErrors(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="username" placeholder="Username" />
              <ErrorMessage name="username" component="div" />
              <Field name="email" placeholder="Email" />
              <ErrorMessage name="email" component="div" />
              <Field name="password" type="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" />

              <button type="submit" disabled={loading || isSubmitting}>
                {loading ? "Loading..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>


        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4CAF50", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
