import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProjects } from "../features/projects/adminProjectsSlice";
import { RootState, AppDispatch } from "../features/auth/index";

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.adminProject
  );

  useEffect(() => {
    dispatch(fetchAdminProjects());
  }, [dispatch]);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading && <p>Loading projects...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong> - {project.description} (
            Worker: {project.worker})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
