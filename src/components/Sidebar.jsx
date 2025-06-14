import React, { useState, useEffect, useRef } from "react";
import AddProjectModal from "./AddProjectModal";
import AddReleaseModal from "./AddReleaseModal";
import AddRunModal from "./AddRunModal";
import { fetchProjects, addProject, fetchReleases, addRelease, fetchRuns, addRun } from "../apiutility";
import "./Sidebar.css";

function Sidebar({ onRunClick, collapsed, setCollapsed }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false);
  const [showAddRunModal, setShowAddRunModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState(true);
  const [releaseOpen, setReleaseOpen] = useState({});
  const [runOpen, setRunOpen] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: null, project: null, release: null });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);

  const contextMenuRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
    fetchReleases()
      .then((data) => setReleases(data))
      .catch(() => setReleases([]))
      .finally(() => setLoadingReleases(false));
    fetchRuns()
      .then((data) => setRuns(data))
      .catch(() => setRuns([]))
      .finally(() => setLoadingRuns(false));
  }, []);

  // Add Project
  const handleAddProject = async (projectName) => {
    try {
      const newProject = await addProject(projectName);
      setProjects((prev) => [...prev, newProject]);
      setSubmenuOpen(true);
    } catch (err) {}
  };

  // Right-click handlers
  const handleProjectRightClick = (e, proj) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "project",
      project: proj,
      release: null,
    });
  };
  const handleReleaseRightClick = (e, rel, proj) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "release",
      project: proj,
      release: rel,
    });
  };

  // Hide context menu on click elsewhere
  useEffect(() => {
    const handleClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu((menu) => ({ ...menu, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenu.visible]);

  // Context menu actions
  const handleAddReleaseOption = () => {
    setShowAddReleaseModal(true);
    setSelectedProject(contextMenu.project);
    setContextMenu((menu) => ({ ...menu, visible: false }));
  };
  const handleAddRunOption = () => {
    setShowAddRunModal(true);
    setSelectedProject(contextMenu.project);
    setSelectedRelease(contextMenu.release);
    setContextMenu((menu) => ({ ...menu, visible: false }));
  };

  // Add release and expand that project
  const handleSaveRelease = async (releaseName) => {
    if (!selectedProject) return;
    try {
      const newRelease = await addRelease({ projectID: selectedProject.projectID, releaseName });
      setReleases((prev) => [...prev, newRelease]);
      setShowAddReleaseModal(false);
      setSelectedProject(null);
      setReleaseOpen((prev) => ({
        ...prev,
        [newRelease.projectID]: true,
      }));
    } catch (err) {
      alert("Failed to add release: " + err.message);
    }
  };

  // Add run and expand that release
  const handleSaveRun = async (runName) => {
    if (!selectedProject || !selectedRelease) return;
    try {
      const newRun = await addRun({ projectID: selectedProject.projectID, releaseID: selectedRelease.releaseID, runName });
      setRuns((prev) => [...prev, newRun]);
      setShowAddRunModal(false);
      setSelectedProject(null);
      setSelectedRelease(null);
      setRunOpen((prev) => ({
        ...prev,
        [newRun.releaseID]: true,
      }));
    } catch (err) {
      alert("Failed to add run: " + err.message);
    }
  };

  // Lookup maps
  const releasesByProject = React.useMemo(() => {
    const grouped = {};
    for (const rel of releases) {
      if (!grouped[rel.projectID]) grouped[rel.projectID] = [];
      grouped[rel.projectID].push(rel);
    }
    return grouped;
  }, [releases]);
  const runsByRelease = React.useMemo(() => {
    const grouped = {};
    for (const run of runs) {
      if (!grouped[run.releaseID]) grouped[run.releaseID] = [];
      grouped[run.releaseID].push(run);
    }
    return grouped;
  }, [runs]);

  // Expand/collapse toggles
  const toggleReleaseOpen = (projectID) => {
    setReleaseOpen((prev) => ({
      ...prev,
      [projectID]: !prev[projectID],
    }));
  };
  const toggleRunOpen = (releaseID) => {
    setRunOpen((prev) => ({
      ...prev,
      [releaseID]: !prev[releaseID],
    }));
  };

  return (
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      {!collapsed && (
        <>
          <div className="sidebar-header">
            <button
              className="add-project-btn"
              title="Add Project"
              onClick={() => setShowAddModal(true)}
            >
              Add Project
            </button>
          </div>
          <ul className="sidebar-menu">
            <li>
              <a href="#">Dashboard</a>
            </li>
            <li>
              <span
                className="sidebar-projects-toggle"
                onClick={() => setSubmenuOpen((o) => !o)}
                title="Show/hide projects"
              >
                Projects <span style={{ fontSize: "0.9em" }}>{submenuOpen ? "▼" : "▶"}</span>
              </span>
              {submenuOpen && (
                <ul className="sidebar-submenu">
                  {loadingProjects ? (
                    <li className="sidebar-submenu-loading">Loading...</li>
                  ) : projects.length === 0 ? (
                    <li className="sidebar-submenu-empty">No projects</li>
                  ) : (
                    projects.map((proj) => {
                      const isReleaseOpen = !!releaseOpen[proj.projectID];
                      return (
                        <li key={proj.id} className="sidebar-submenu-item">
                          <div
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                            onContextMenu={e => handleProjectRightClick(e, proj)}
                          >
                            <a href="#" style={{ fontWeight: 500, flex: 1 }}>{proj.projectName}</a>
                            <span
                              className="sidebar-release-toggle"
                              onClick={() => toggleReleaseOpen(proj.projectID)}
                              style={{ cursor: "pointer", marginLeft: "0.3em", userSelect: "none" }}
                              title={isReleaseOpen ? "Collapse releases" : "Expand releases"}
                            >
                              {isReleaseOpen ? "▼" : "▶"}
                            </span>
                          </div>
                          {isReleaseOpen && (
                            <ul className="sidebar-releases-list">
                              {(releasesByProject[proj.projectID] || []).map(rel => {
                                const isRunOpen = !!runOpen[rel.releaseID];
                                return (
                                  <li key={rel.id || rel.releaseID} className="sidebar-release-item">
                                    <div
                                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                      onContextMenu={e => handleReleaseRightClick(e, rel, proj)}
                                    >
                                      <span style={{ flex: 1 }}>{rel.releaseName}</span>
                                      <span
                                        className="sidebar-run-toggle"
                                        onClick={() => toggleRunOpen(rel.releaseID)}
                                        style={{ cursor: "pointer", marginLeft: "0.3em", userSelect: "none" }}
                                        title={isRunOpen ? "Collapse runs" : "Expand runs"}
                                      >
                                        {isRunOpen ? "▼" : "▶"}
                                      </span>
                                    </div>
                                    {isRunOpen && (
                                      <ul className="sidebar-runs-list">
                                        {(runsByRelease[rel.releaseID] || []).map(run => (
                                          <li key={run.id || run.runID} className="sidebar-run-item">
                                            <span
                                              style={{ cursor: "pointer", color: "#388e3c" }}
                                              onClick={() => onRunClick && onRunClick(run)}
                                            >
                                              {run.runName}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </li>
            <li>
              <a href="#">Reports</a>
            </li>
          </ul>
          <AddProjectModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddProject}
          />
          <AddReleaseModal
            open={showAddReleaseModal}
            onClose={() => {
              setShowAddReleaseModal(false);
              setSelectedProject(null);
            }}
            onSave={handleSaveRelease}
            projectName={selectedProject?.projectName}
          />
          <AddRunModal
            open={showAddRunModal}
            onClose={() => {
              setShowAddRunModal(false);
              setSelectedProject(null);
              setSelectedRelease(null);
            }}
            onSave={handleSaveRun}
            releaseName={selectedRelease?.releaseName}
          />
          {contextMenu.visible && (
            <div
              ref={contextMenuRef}
              className="sidebar-context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x, position: "fixed" }}
            >
              {contextMenu.type === "project" && (
                <button
                  className="sidebar-context-menu-option"
                  onClick={handleAddReleaseOption}
                >
                  Add release
                </button>
              )}
              {contextMenu.type === "release" && (
                <button
                  className="sidebar-context-menu-option"
                  onClick={handleAddRunOption}
                >
                  Add run
                </button>
              )}
            </div>
          )}
        </>
      )}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? "⮞" : "⮜"}
      </button>
    </aside>
  );
}

export default Sidebar;