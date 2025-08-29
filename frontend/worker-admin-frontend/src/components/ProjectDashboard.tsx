import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { fetchProjects, createProject, updateProjectStatus } from "../features/projects/projectSlice";
import { searchProjects, clearSearch } from "../features/projects/projectSearchSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { data } from "react-router-dom";


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

  // state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);


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

  const displayedProjects = React.useMemo(() => {
    return searchResults.length > 0 ? searchResults : projects;
  }, [searchResults, projects]);

  const paginatedProjects = displayedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  // Helper to highlight matching search term
  const highlightMatch = React.useCallback((text: string) => {
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
  }, [searchTerm]);

  const statusData = React.useMemo(() => [
    {
      status: "COMPLETED",
      count: displayedProjects.filter(p => p.status === "COMPLETED").length,
    },
    {
      status: "IN_PROGRESS",
      count: displayedProjects.filter(p => p.status === "IN_PROGRESS").length,
    },
  ], [displayedProjects]);


  const isFormValid = React.useMemo(() => {
    return name.trim() && description.trim() && startDate && finishDate && new Date(finishDate) > new Date(startDate);
  }, [name, description, startDate, finishDate]);

  const handleExport = () => {
    const dataToExport = displayedProjects.map((p) => ({
      ID: p.id,
      Name: p.name,
      Description: p.description,
      Status: p.status,
      "Start Date": p.start_date ? new Date(p.start_date).toLocaleDateString() : "",
      "Finish Date": p.finish_date ? new Date(p.finish_date).toLocaleDateString() : "",
      "Created At": new Date(p.created_at).toLocaleString(),
    }));
    console.log(dataToExport)
    const csvHeader = Object.keys(dataToExport[0]).join(',') + "\n";
    const csvRows = dataToExport
      .map(row =>
        Object.values(row)
          .map(value => `"${String(value).replace(/"/g, '""')}"`) // escape quotes
          .join(",")
      )
    .join("\n");    
    console.log("csvHeader", csvHeader)
    console.log("csvRows", csvRows)

    const csvContent = csvHeader + csvRows;
    console.log("csvContent",csvContent);

     // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Create Project Form */}
      {/* Create Project Form + Search Bar Inline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Create Project Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            flex: 1,
            maxWidth: "500px",
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", color: "#333" }}>Create New Project</h2>
          <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          <input type="date" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} style={inputStyle} />
          {startDate && finishDate && new Date(finishDate) <= new Date(startDate) && (
            <span style={{ color: "red", fontSize: "0.85rem" }}>
              Finish date must be after start date
            </span>
          )}
          <button type="submit" disabled={loading || !isFormValid} style={{ padding: "0.75rem", borderRadius: "6px", border: "none", backgroundColor: "#4CAF50", color: "#fff", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: "400px", marginTop:'22rem', marginRight:'15rem' }}>
          <h2 style={{ fontSize: "1.5rem", color: "#333" }}>Search My Projects</h2>
          <input
            type="text"
            placeholder="Search by exact name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, width: "100%", marginBottom: "1rem" }}
          />
          {searchLoading && <p>Searching...</p>}
          {searchError && <p style={{ color: "red" }}>{searchError}</p>}
        </div>
      </div>


  {/* Projects List */}
  <h2 style={{ marginTop: "2.5rem", fontSize: "2rem", color: "#333" }}>My Projects</h2>
  {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
  <button
    onClick={handleExport}
    style={{
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#1976d2",
      color: "#fff",
      fontWeight: "bold",
      cursor: "pointer",
      marginBottom: "1rem",
    }}
  >
    Export Projects
  </button>

{/* Projects List */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  }}
>
  {paginatedProjects.map((p) => (
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

      {(p.status === "IN_PROGRESS" || p.status === "PENDING" || p.status === "COMPLETED") && (
        <button
          onClick={() => {
            const newStatus = p.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
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
  ))}
</div>

{/* Pagination Bar */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "2rem",
    gap: "0.5rem",
  }}
>
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
    style={{
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: currentPage === 1 ? "#eee" : "#fff",
      cursor: currentPage === 1 ? "not-allowed" : "pointer",
    }}
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: currentPage === page ? "#4CAF50" : "#fff",
        color: currentPage === page ? "#fff" : "#333",
        fontWeight: currentPage === page ? "bold" : "normal",
        cursor: "pointer",
      }}
    >
      {page}
    </button>
  ))}

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
    style={{
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: currentPage === totalPages ? "#eee" : "#fff",
      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
    }}
  >
    Next
  </button>
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
