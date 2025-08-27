import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { fetchProjects, createProject } from "../features/projects/projectSlice";

const ProjectDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((state) => state.projects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createProject({ name, description }));
    setName("");
    setDescription("");
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "2rem", color: "#333" }}>Create New Project</h2>
      
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "500px",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            minHeight: "80px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.3s",
          }}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      <h2 style={{ marginTop: "2.5rem", fontSize: "2rem", color: "#333" }}>My Projects</h2>
      {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              backgroundColor: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <h3 style={{ margin: 0, color: "#222" }}>{p.name}</h3>
            <p style={{ margin: 0, color: "#555" }}>{p.description || "No description provided."}</p>
            <span style={{ fontSize: "0.85rem", color: "#999" }}>
              Created at: {new Date(p.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
