import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import {
  fetchProjects,
  createProject,
  updateProjectStatus,
} from "../features/projects/projectSlice";
import { searchProjects, clearSearch } from "../features/projects/projectSearchSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ✅ Step 1: Add translations
const translations = {
  en: {
    appName: "Ergo",
    logout: "Logout",
    welcome: "Welcome",
    defaultUser: "Worker",
    warningTitle: "Warning!",
    warningMessage: "You will be logged out in 5 seconds due to inactivity.",
    continue: "Continue Session",
    createProject: "Create New Project",
    projectName: "Project Name",
    description: "Description",
    startDate: "Start Date",
    finishDate: "Finish Date",
    finishDateError: "Finish date must be after start date",
    creating: "Creating...",
    createButton: "Create Project",
    searchProjects: "Search My Projects",
    searchPlaceholder: "Search by exact name",
    searching: "Searching...",
    noProjectsExport: "No projects to export.",
    exportButton: "Export Projects",
    noDescription: "No description provided.",
    status: "Status",
    markInProgress: "Mark In Progress",
    markCompleted: "Mark Completed",
    projectStatusOverview: "Project Status Overview",
    prev: "Prev",
    next: "Next",
  },
  gr: {
    appName: "Έργο",
    logout: "Αποσύνδεση",
    welcome: "Καλώς ήρθες",
    defaultUser: "Εργαζόμενος",
    warningTitle: "Προειδοποίηση!",
    warningMessage: "Θα αποσυνδεθείτε σε 5 δευτερόλεπτα λόγω αδράνειας.",
    continue: "Συνέχεια συνεδρίας",
    createProject: "Δημιουργία Νέου Έργου",
    projectName: "Όνομα Έργου",
    description: "Περιγραφή",
    startDate: "Ημερομηνία Έναρξης",
    finishDate: "Ημερομηνία Λήξης",
    finishDateError: "Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης",
    creating: "Δημιουργία...",
    createButton: "Δημιουργία Έργου",
    searchProjects: "Αναζήτηση Έργων Μου",
    searchPlaceholder: "Αναζήτηση με ακριβές όνομα",
    searching: "Αναζήτηση...",
    noProjectsExport: "Δεν υπάρχουν έργα για εξαγωγή.",
    exportButton: "Εξαγωγή Έργων",
    noDescription: "Δεν παρέχεται περιγραφή.",
    status: "Κατάσταση",
    markInProgress: "Ορισμός σε Εν Εξέλιξη",
    markCompleted: "Ορισμός Ολοκληρωμένο",
    projectStatusOverview: "Σύνοψη Κατάστασης Έργων",
    prev: "Προηγούμενο",
    next: "Επόμενο",
  },
};
interface ProjectDashboardProps {
  language: "en" | "gr";
  translations: typeof translations; // pass the full translations object
}

const ProjectDashboard:React.FC<ProjectDashboardProps> = ({ language, translations }) => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  // ✅ Step 2: Add language state
  const t = translations[language]; // easy access to HomePage texts

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

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
    }, 400);

    return () => clearTimeout(handler);
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

  const paginatedProjects = displayedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const highlightMatch = React.useCallback(
    (text: string) => {
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
    },
    [searchTerm]
  );

  const statusData = React.useMemo(
    () => [
      {
        status: "COMPLETED",
        count: displayedProjects.filter((p) => p.status === "COMPLETED").length,
      },
      {
        status: "IN_PROGRESS",
        count: displayedProjects.filter((p) => p.status === "IN_PROGRESS").length,
      },
    ],
    [displayedProjects]
  );

  const isFormValid = React.useMemo(() => {
    return (
      name.trim() &&
      description.trim() &&
      startDate &&
      finishDate &&
      new Date(finishDate) > new Date(startDate)
    );
  }, [name, description, startDate, finishDate]);

  const handleExport = () => {
    if (displayedProjects.length === 0) {
      alert(t.noProjectsExport);
      return;
    }
    const dataToExport = displayedProjects.map((p) => ({
      ID: p.id,
      Name: p.name,
      Description: p.description,
      Status: p.status,
      "Start Date": p.start_date ? new Date(p.start_date).toLocaleDateString() : "",
      "Finish Date": p.finish_date ? new Date(p.finish_date).toLocaleDateString() : "",
      "Created At": new Date(p.created_at).toLocaleString(),
    }));
    const csvHeader = Object.keys(dataToExport[0]).join(",") + "\n";
    const csvRows = dataToExport
      .map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* ✅ Step 3: Language switcher */}
      
      {/* Create Project Form + Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", marginBottom: "2rem" }}>
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
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", color: "#333" }}>
            {t.createProject}
          </h2>
          <input type="text" placeholder={t.projectName} value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <textarea placeholder={t.description} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          <input type="date" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} style={inputStyle} />
          {startDate && finishDate && new Date(finishDate) <= new Date(startDate) && (
            <span style={{ color: "red", fontSize: "0.85rem" }}>{t.finishDateError}</span>
          )}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? t.creating : t.createButton}
          </button>
        </form>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: "400px", marginTop: "22rem", marginRight: "15rem" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#333" }}>{t.searchProjects}</h2>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, width: "100%", marginBottom: "1rem" }}
          />
          {searchLoading && <p>{t.searching}</p>}
          {searchError && <p style={{ color: "red" }}>{searchError}</p>}
        </div>
      </div>

      {/* Projects List and Export */}
      <h2 style={{ marginTop: "2.5rem", fontSize: "2rem", color: "#333" }}>{t.createProject}</h2>
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
        {t.exportButton}
      </button>

      {/* Render projects grid and pagination... */}
      {/* Add the chart and other elements similarly using t.xxx for text */}
    </div>
  );
};

export default ProjectDashboard;
