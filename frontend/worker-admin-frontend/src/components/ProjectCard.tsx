// src/components/ProjectCard.tsx
import React from "react";

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  start_date?: string;
  finish_date?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  latitude?: number | null;
  longitude?: number | null;
}

interface Props {
  project: Project;
  highlightMatch: (text: string) => React.ReactNode;
  onUpdateStatus: (id: number, status: Project["status"]) => void;
}

const ProjectCard: React.FC<Props> = ({
  project,
  highlightMatch,
  onUpdateStatus,
}) => {
  return (
    <div
      key={project.id}
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
      <h3 style={{ margin: 0, color: "#222" }}>
        {highlightMatch(project.name)}
      </h3>
      <p style={{ margin: 0, color: "#555" }}>
        {project.description || "No description provided."}
      </p>

      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Created at: {new Date(project.created_at).toLocaleString()}
      </span>
      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Start Date:{" "}
        {project.start_date
          ? new Date(project.start_date).toLocaleDateString()
          : "N/A"}
      </span>
      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Finish Date:{" "}
        {project.finish_date
          ? new Date(project.finish_date).toLocaleDateString()
          : "N/A"}
      </span>

      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: "bold",
          color:
            project.status === "COMPLETED"
              ? "green"
              : project.status === "IN_PROGRESS"
              ? "orange"
              : "gray",
        }}
      >
        Status: {project.status}
      </span>

      <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        Lat: {project.latitude ?? "N/A"}
      </span>
      <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        Lon: {project.longitude ?? "N/A"}
      </span>
      {/* Status update button */}
      {(project.status === "IN_PROGRESS" ||
        project.status === "PENDING" ||
        project.status === "COMPLETED") && (
        <button
          onClick={() =>
            onUpdateStatus(
              project.id,
              project.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
            )
          }
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 0.75rem",
            border: "none",
            borderRadius: "4px",
            backgroundColor:
              project.status === "COMPLETED" ? "#FFA500" : "#4CAF50",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {project.status === "COMPLETED"
            ? "Mark In Progress"
            : "Mark Completed"}
        </button>
      )}
    </div>
  );
};

export default ProjectCard;
