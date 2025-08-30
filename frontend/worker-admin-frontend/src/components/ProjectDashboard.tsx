import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../features/auth/hooks";
import { fetchProjects, createProject, updateProjectStatus, Project } from "../features/projects/projectSlice";
import { searchProjects, clearSearch } from "../features/projects/projectSearchSlice";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue in Leaflet + TS
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import ProjectCard from "./ProjectCard";

(L.Icon.Default as any).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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




  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Leaflet map
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null); // store map instance


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

const [popupOpen, setPopupOpen] = useState(false);
const [popupCoordinates, setPopupCoordinates] = useState<{ lat: number; lng: number } | null>(null);
const [popupProjectName, setPopupProjectName] = useState("");
const popupMapRef = useRef<HTMLDivElement>(null);
const popupMapInstanceRef = useRef<L.Map | null>(null);
const popupMarkerRef = useRef<L.Marker | null>(null);

// Open popup with project coordinates
const handleShowProjectOnMap = (project: Project) => {
  if (!project.latitude || !project.longitude) return;

    // If popup was already open, reset marker first
  if (popupMarkerRef.current) {
    popupMarkerRef.current.remove();
    popupMarkerRef.current = null;
  }

  setPopupCoordinates({ lat: Number(project.latitude), lng: Number(project.longitude) });
  setPopupProjectName(project.name);
  setPopupOpen(true);
};

const handleClosePopup = () => {
  setPopupOpen(false);
  // Optional: remove marker
  if (popupMarkerRef.current) {
    popupMarkerRef.current.remove();
    popupMarkerRef.current = null;
  }

    // Optional: reset coordinates & project name
  setPopupCoordinates(null);
  setPopupProjectName("");
};



// Render / Update map when popup opens
useEffect(() => {
  if (!popupOpen || !popupCoordinates || !popupMapRef.current) return;

  // Initialize map if not yet created
  if (!popupMapInstanceRef.current) {
    const mapInstance = L.map(popupMapRef.current).setView([popupCoordinates.lat, popupCoordinates.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    const marker = L.marker([popupCoordinates.lat, popupCoordinates.lng])
      .addTo(mapInstance)
      .bindPopup(`<b>${popupProjectName}</b><br/>Lat: ${popupCoordinates.lat.toFixed(6)}, Lon: ${popupCoordinates.lng.toFixed(6)}`)
      .openPopup();

    popupMapInstanceRef.current = mapInstance;
    popupMarkerRef.current = marker;
  } else {
    // Map exists → update marker & center
    popupMapInstanceRef.current.setView([popupCoordinates.lat, popupCoordinates.lng], 12);

    if (popupMarkerRef.current) {
      popupMarkerRef.current
        .setLatLng([popupCoordinates.lat, popupCoordinates.lng])
        .setPopupContent(`<b>${popupProjectName}</b><br/>Lat: ${popupCoordinates.lat.toFixed(6)}, Lon: ${popupCoordinates.lng.toFixed(6)}`)
        .openPopup();
    } else {
      popupMarkerRef.current = L.marker([popupCoordinates.lat, popupCoordinates.lng])
        .addTo(popupMapInstanceRef.current)
        .bindPopup(`<b>${popupProjectName}</b><br/>Lat: ${popupCoordinates.lat.toFixed(6)}, Lon: ${popupCoordinates.lng.toFixed(6)}`)
        .openPopup();
    }
  }

  // Leaflet sometimes needs invalidateSize for hidden divs
  setTimeout(() => {
    popupMapInstanceRef.current?.invalidateSize();
  }, 50);
}, [popupOpen, popupCoordinates, popupProjectName]);







  // Fetch projects
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

const showProjectOnMap = (lat: number, lng: number, name: string) => {
  if (!mapInstanceRef.current) return;

  const mapInstance = mapInstanceRef.current;

  // Make sure the map container is visible (in case of hidden tab/panel)
  setTimeout(() => mapInstance.invalidateSize(), 100);

  // Remove previous marker if exists
  if (marker) {
    marker.remove();
    setMarker(null);
  }

  // Add new marker
  const newMarker = L.marker([lat, lng]).addTo(mapInstance);
  newMarker.bindPopup(`<b>${name}</b><br/>Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`).openPopup();
  setMarker(newMarker);

  // Pan & zoom the map to the marker
  mapInstance.setView([lat, lng], 12); // zoom level can be adjusted
};






  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) dispatch(searchProjects(searchTerm));
      else dispatch(clearSearch());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, dispatch]);

useEffect(() => {
  if (mapRef.current && !mapInstanceRef.current) {
    const mapInstance = L.map(mapRef.current).setView([39.0742, 21.8243], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    mapInstance.on("click", (e: L.LeafletMouseEvent) => {
      if (marker) marker.remove();
      const newMarker = L.marker(e.latlng).addTo(mapInstance);
      setMarker(newMarker);
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = mapInstance;

    // Force Leaflet to recalc size after render
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);
  }
}, []); // empty dependency array ensures it runs only once

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        name,
        description,
        start_date: startDate,
        finish_date: finishDate,
        latitude: coordinates ? Number(coordinates.lat.toFixed(6)) : null,
        longitude: coordinates ? Number(coordinates.lng.toFixed(6)) : null,
      }
    console.log(payload)
    dispatch(
      createProject(payload)
    );
    setName("");
    setDescription("");
    setStartDate("");
    setFinishDate("");
    setCoordinates(null);
    if (marker) {
      marker.remove();
      setMarker(null);
    }
  };

  const displayedProjects = React.useMemo(() => searchResults.length > 0 ? searchResults : projects, [searchResults, projects]);
  const paginatedProjects = displayedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(displayedProjects.length / itemsPerPage);

  const highlightMatch = React.useCallback((text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, i) => regex.test(part) ? <mark key={i} style={{ backgroundColor: "yellow" }}>{part}</mark> : part);
  }, [searchTerm]);

  const statusData = React.useMemo(() => [
    { status: "COMPLETED", count: displayedProjects.filter(p => p.status === "COMPLETED").length },
    { status: "IN_PROGRESS", count: displayedProjects.filter(p => p.status === "IN_PROGRESS").length },
  ], [displayedProjects]);

  const isFormValid = React.useMemo(() => {
    return name.trim() && description.trim() && startDate && finishDate && new Date(finishDate) > new Date(startDate);
  }, [name, description, startDate, finishDate]);

  const inputStyle: React.CSSProperties = { padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" };

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
    const csvHeader = Object.keys(dataToExport[0]).join(',') + "\n";
    const csvRows = dataToExport.map(row => Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Form + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", marginBottom: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, maxWidth: "500px", backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", color: "#333" }}>Create New Project</h2>
          <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          <input type="date" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} style={inputStyle} />
          {startDate && finishDate && new Date(finishDate) <= new Date(startDate) && <span style={{ color: "red", fontSize: "0.85rem" }}>Finish date must be after start date</span>}

          {/* Map */}
          <div ref={mapRef} style={{ height: "300px", width: "100%", borderRadius: "8px", marginBottom: "1rem" }} />
          {coordinates && <p>Selected Coordinates: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</p>}

          <button type="submit" disabled={loading || !isFormValid} style={{ padding: "0.75rem", borderRadius: "6px", border: "none", backgroundColor: "#4CAF50", color: "#fff", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: "400px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#333" }}>Search My Projects</h2>
          <input type="text" placeholder="Search by exact name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "1rem" }} />
          {searchLoading && <p>Searching...</p>}
          {searchError && <p style={{ color: "red" }}>{searchError}</p>}
      </div>
      {/* Projects List */}
      {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
      <button onClick={handleExport} style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#1976d2", color: "#fff", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem" }}>Export Projects</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        {paginatedProjects.map((p) => (
          <ProjectCard 
            key={p.id}
            project={p} 
            highlightMatch={highlightMatch} 
            onUpdateStatus={(id, status) => dispatch(updateProjectStatus({ id, status }))}/>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "2rem", gap: "0.5rem" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: currentPage === 1 ? "#eee" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: currentPage === page ? "#4CAF50" : "#fff", color: currentPage === page ? "#fff" : "#333", fontWeight: currentPage === page ? "bold" : "normal", cursor: "pointer" }}>{page}</button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: currentPage === totalPages ? "#eee" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
      </div>

      {/* Chart */}
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

{popupOpen && (
  <div className="popup-overlay" style={{
    position: "fixed", top:0, left:0, width:"100%", height:"100%",
    backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center",
    alignItems:"center", zIndex:1000
  }}>
    <div className="popup-content" style={{
      backgroundColor:"#fff", padding:"1rem", borderRadius:"8px",
      width:"80%", maxWidth:"600px", position:"relative"
    }}>
      <button
        onClick={handleClosePopup}
        style={{ position:"absolute", top:"10px", right:"10px", padding:"0.5rem", cursor:"pointer" }}
      >
        Close
      </button>
      <div ref={popupMapRef} style={{ height: "400px", width: "100%" }} />
    </div>
  </div>
)}
    </div>
  );
};

export default ProjectDashboard;
