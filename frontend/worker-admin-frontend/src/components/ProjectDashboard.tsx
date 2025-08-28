import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { fetchProjects, createProject, updateProjectStatus } from "../features/projects/projectSlice";
import { searchProjects, clearSearch } from "../features/projects/projectSearchSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


const ProjectDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((state) => state.projects);
  const { results: searchResults, loading: searchLoading, error: searchError } = useAppSelector(
    (state) => state.projectSearch
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Input style
  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  };

  // Debounced live search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        dispatch(searchProjects(searchTerm));
      } else {
        dispatch(clearSearch());
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler); // Cleanup if input changes
  }, [searchTerm, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      createProject({
        name,
        description,
        start_date: startDate,
        finish_date: finishDate,
      })
    );
    setName("");
    setDescription("");
    setStartDate("");
    setFinishDate("");
  };

  const displayedProjects = searchResults.length > 0 ? searchResults : projects;

  // Helper to highlight matching search term
  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: "yellow" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const statusData = [
     {
      status: "COMPLETED",
      count: displayedProjects.filter(p => p.status === "COMPLETED").length,
    },
    {
      status: "IN_PROGRESS",
      count: displayedProjects.filter(p => p.status === "IN_PROGRESS").length,
    },
  ]

  const isFormValid = name.trim() && description.trim() && startDate && finishDate && new Date(finishDate) > new Date(startDate);


  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Create Project Form */}
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
        <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} />
        <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        <input type="date" placeholder="Finish Date" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} style={inputStyle} />
        {startDate && finishDate && new Date(finishDate) <= new Date(startDate) && (
          <span style={{ color: "red", fontSize: "0.85rem" }}>
            Finish date must be after start date
          </span>
        )}
        <button type="submit" disabled={loading || !isFormValid} style={{ padding: "0.75rem", borderRadius: "6px", border: "none", backgroundColor: "#4CAF50", color: "#fff", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.3s" }}>
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      {/* Live Search */}
      <h2 style={{ marginTop: "2.5rem", fontSize: "2rem", color: "#333" }}>Search My Projects</h2>
      <input
        type="text"
        placeholder="Search by exact name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...inputStyle, marginBottom: "1rem", maxWidth: "500px" }}
      />
      {searchLoading && <p>Searching...</p>}
      {searchError && <p style={{ color: "red" }}>{searchError}</p>}

      {/* Projects List */}
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
{displayedProjects.map((p) => {
  console.log("Rendering project:", p);
  return (
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
      <h3 style={{ margin: 0, color: "#222" }}>{highlightMatch(p.name)}</h3>
      <p style={{ margin: 0, color: "#555" }}>{p.description || "No description provided."}</p>
      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Created at: {new Date(p.created_at).toLocaleString()}
      </span>
      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Start Date: {p.start_date ? new Date(p.start_date).toLocaleDateString() : "N/A"}
      </span>
      <span style={{ fontSize: "0.85rem", color: "#999" }}>
        Finish Date: {p.finish_date ? new Date(p.finish_date).toLocaleDateString() : "N/A"}
      </span>

      {/* Project Status */}
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: "bold",
          color:
            p.status === "COMPLETED"
              ? "green"
              : p.status === "IN_PROGRESS"
              ? "orange"
              : "gray",
        }}
      >
        Status: {p.status}
      </span>

      {/* Toggle Status Button */}
      {(p.status === "IN_PROGRESS" || p.status === "PENDING" || p.status === "COMPLETED") && (
        <button
          onClick={() => {
            const newStatus = p.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
            console.log(`Updating project ${p.id} status to ${newStatus}`);
            dispatch(updateProjectStatus({ id: p.id, status: newStatus }));
          }}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 0.75rem",
            border: "none",
            borderRadius: "4px",
            backgroundColor: p.status === "COMPLETED" ? "#FFA500" : "#4CAF50",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {p.status === "COMPLETED" ? "Mark In Progress" : "Mark Completed"}
        </button>
      )}
    </div>
  );
})}


</div>
{/* Add the chart AFTER the projects list */}
<h2 style={{ marginTop: "2.5rem", fontSize: "2rem", color: "#333" }}>Project Status Overview</h2>
<div style={{ width: "100%", height: 300 }}>
  <ResponsiveContainer>
    <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
</div>
</div>
  );
};

export default ProjectDashboard;
