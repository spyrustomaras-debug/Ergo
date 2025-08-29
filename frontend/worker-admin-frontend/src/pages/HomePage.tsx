import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "../components/ProjectDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { useIdleTimer } from "../hooks/useIdleTimer";


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


const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, role, error } = useAppSelector((state) => state.auth);
  const [showWarning, setShowWarning] = useState(false);

  // ✅ Step 2: Add language state
  const [language, setLanguage] = useState<"en" | "gr">("en");
  const t = translations[language];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); 
  };

  const handleWarning = () => {
    setShowWarning(true);
  };

  useIdleTimer({
    timeout: 60000,        
    warningTime: 5000,     
    onIdle: handleLogout,
    onWarning: handleWarning,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#4CAF50",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          {t.appName}
        </h1>

        {/* ✅ Step 3: Language Switcher */}
        <div>
          <button onClick={() => setLanguage("en")} disabled={language === "en"}>
            EN
          </button>
          <button
            onClick={() => setLanguage("gr")}
            disabled={language === "gr"}
            style={{ marginLeft: "0.5rem" }}
          >
            GR
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            cursor: "pointer",
            marginLeft: "1rem",
          }}
        >
          {t.logout}
        </button>
      </header>

    <main style={{ padding: "2rem" }}>
      <h2>
        {t.welcome}, {user?.username || t.defaultUser}!
      </h2>

      {error && (
        <p style={{ color: "red" }}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </p>
      )}

      {role === "ADMIN" ? (
        <AdminDashboard />
      ) : (
        <ProjectDashboard/>
      )}
    </main>

      {/* Warning Modal */}
      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h2>{t.warningTitle}</h2>
            <p>{t.warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {t.continue}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
