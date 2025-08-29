import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: "0.5rem", color: "#4CAF50" }}>404</h1>
      <h2 style={{ margin: "0.5rem" }}>Page Not Found</h2>
      <p style={{ margin: "1rem 0" }}>
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "4px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
