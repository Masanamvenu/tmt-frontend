import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DisplayProjectsCard from "../components/DisplayProjectsCard";
import { fetchProjects } from "../apiutility";
import "./DashboardPage.css";

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 48;
const PROJECTS_PER_PAGE = 6;

const DashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchProjects()
      .then(setProjects)
      .catch((err) => setError(err.message || "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Paginated projects
  const paginatedProjects = projects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  );

  return (
    <div className="dashboard-page">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div
        className={`dashboard-right-section${sidebarCollapsed ? " dashboard-right-section-collapsed" : ""}`}
        style={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: "margin-left 0.2s"
        }}
      >
        <div className="dashboard-title-container">
          <h2 className="dashboard-title">Projects Dashboard</h2>
        </div>
        {loading ? (
          <div className="dashboard-loading">Loading projects...</div>
        ) : error ? (
          <div className="dashboard-error">{error}</div>
        ) : (
          <>
            <div className="dashboard-projects-list">
              {paginatedProjects.map((project) => (
                <DisplayProjectsCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
            {/* Always show pagination */}
            <div className="pagination-container">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lt;
              </button>
              {[...Array(totalPages).keys()].map((n) => (
                <button
                  key={n + 1}
                  className={`pagination-btn${currentPage === n + 1 ? " active" : ""}`}
                  onClick={() => handlePageChange(n + 1)}
                >
                  {n + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;