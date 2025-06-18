import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import AddProjectModal from "./AddProjectModal";
import AddReleaseModal from "./AddReleaseModal";
import AddRunModal from "./AddRunModal";
import Reports from "./Reports";
//import { getTestResults } from "../apiutility"; // Assuming this is the correct import for fetching test results
import {
  fetchProjects,
  addProject,
  fetchReleases,
  addRelease,
  fetchRuns,
  addRun,
  getTestResults,
} from "../apiutility";
import "./Sidebar.css";

const ICONS = {
  folder: (
    <span className="sidebar-icon" title="Project Folder">
      <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight: 5, verticalAlign: "middle"}}>
        <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h3.086a1.5 1.5 0 0 1 1.06.44l1.414 1.414A1.5 1.5 0 0 0 11.12 6H15.5A2.5 2.5 0 0 1 18 8.5v5A2.5 2.5 0 0 1 15.5 16h-11A2.5 2.5 0 0 1 2 13.5v-7z" fill="#FDB927"/>
        <path d="M2 7v6.5A2.5 2.5 0 0 0 4.5 16h11A2.5 2.5 0 0 0 18 13.5V8.5A2.5 2.5 0 0 0 15.5 6h-4.38a1.5 1.5 0 0 1-1.06-.44L8.646 4.146A1.5 1.5 0 0 0 7.586 4H4.5A2.5 2.5 0 0 0 2 6.5V7z" fill="#FBC02D"/>
      </svg>
    </span>
  ),
  release: (
    <span className="sidebar-icon" title="Release">
      <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight: 5, verticalAlign: "middle"}}>
        <circle cx="10" cy="10" r="8" fill="#43a047"/>
        <path d="M10 7v3l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  ),
  run: (
    <span className="sidebar-icon" title="Test Run">
      <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight: 5, verticalAlign: "middle"}}>
        <rect x="3" y="3" width="14" height="14" rx="7" fill="#ff9800"/>
        <polygon points="8,6 14,10 8,14" fill="#fff"/>
      </svg>
    </span>
  ),
};

function Sidebar({ onRunClick, collapsed, setCollapsed }) {
  // fallback to internal state if not provided
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = typeof collapsed === "boolean" ? collapsed : internalCollapsed;
  const handleCollapseClick = () => {
    if (typeof setCollapsed === "function") {
      setCollapsed((prev) => !prev);
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };
console.log(getTestResults);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false);
  const [showAddRunModal, setShowAddRunModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: null,
    project: null,
    release: null,
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);

  // State for My Projects open/collapse
  const [myProjectsOpen, setMyProjectsOpen] = useState(false);
  // State for open project folders (multiple can be open, use Set for efficient toggling)
  const [openProjectIds, setOpenProjectIds] = useState(new Set());
  // State for open release folders: { [projectId]: Set of open releaseIds }
  const [openReleaseIds, setOpenReleaseIds] = useState({});

  // State for Reports menu open/collapse
  const [reportsOpen, setReportsOpen] = useState(false);
  const [openReportsProjectIds, setOpenReportsProjectIds] = useState(new Set());
  const [openReportsReleaseIds, setOpenReportsReleaseIds] = useState({});

  // State for selected items in Reports menu
  const [selectedReportsProjectID, setSelectedReportsProjectID] = useState(null);
  const [selectedReportsReleaseID, setSelectedReportsReleaseID] = useState(null);
  const [selectedReportsRunID, setSelectedReportsRunID] = useState(null);

  const contextMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoadingProjects(false));
    fetchReleases().then(setReleases).catch(() => setReleases([])).finally(() => setLoadingReleases(false));
    fetchRuns().then(setRuns).catch(() => setRuns([])).finally(() => setLoadingRuns(false));
  }, []);

  useEffect(() => {
    if (myProjectsOpen && location.pathname !== "/myprojects") {
      navigate("/myprojects");
    }
  }, [myProjectsOpen, location.pathname, navigate]);

  useEffect(() => {
    if (reportsOpen && location.pathname !== "/reports") {
      navigate("/reports");
    }
  }, [reportsOpen, location.pathname, navigate]);

  const handleProjectRightClick = (e, proj) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "myprojects-project",
      project: proj,
      release: null,
    });
  };

  const handleReleaseRightClick = (e, rel, proj) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "myprojects-release",
      project: proj,
      release: rel,
    });
  };

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

  const handleAddProject = async (projectName) => {
    try {
      const newProject = await addProject(projectName);
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {}
  };

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

  const handleSaveRelease = async (releaseName) => {
    if (!selectedProject) return;
    try {
      const newRelease = await addRelease({
        projectID: selectedProject.projectID,
        releaseName,
      });
      setReleases((prev) => [...prev, newRelease]);
      setShowAddReleaseModal(false);
      setSelectedProject(null);
    } catch (err) {
      alert("Failed to add release: " + err.message);
    }
  };

  const handleSaveRun = async (runName) => {
    if (!selectedProject || !selectedRelease) return;
    try {
      const newRun = await addRun({
        projectID: selectedProject.projectID,
        releaseID: selectedRelease.releaseID,
        runName,
      });
      setRuns((prev) => [...prev, newRun]);
      setShowAddRunModal(false);
      setSelectedProject(null);
      setSelectedRelease(null);
    } catch (err) {
      alert("Failed to add run: " + err.message);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

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

  // My Projects handlers
  const handleMyProjectsMenuClick = (e) => {
    e.preventDefault();
    setMyProjectsOpen((prevOpen) => !prevOpen);
    // Do not collapse Reports menu when My Projects is opened
  };

  // Reports menu handlers (do not collapse My Projects menu when Reports is opened)
  const handleReportsMenuClick = (e) => {
    e.preventDefault();
    setReportsOpen((prevOpen) => !prevOpen);
    // Do not collapse My Projects menu when Reports is opened
  };

  // --- FIX: Don't collapse the other menu when opening one ---
  // Remove collapse logic from handleMyProjectsMenuClick and handleReportsMenuClick
  // Only collapse menus when navigating away from their respective pages

  const handleProjectMenuClick = (projectID) => {
    setOpenProjectIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(projectID)) {
        newSet.delete(projectID);
        setOpenReleaseIds((prev) => ({ ...prev, [projectID]: new Set() }));
      } else {
        newSet.add(projectID);
      }
      return newSet;
    });
  };

  const handleReleaseMenuClick = (projectID, releaseID) => {
    setOpenReleaseIds((prev) => {
      const prevSet = prev[projectID] || new Set();
      const newSet = new Set(prevSet);
      if (newSet.has(releaseID)) {
        newSet.delete(releaseID);
      } else {
        newSet.add(releaseID);
      }
      return { ...prev, [projectID]: newSet };
    });
  };

  // Reports menu selection logic
  const handleReportsProjectMenuClick = (projectID) => {
    setOpenReportsProjectIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(projectID)) {
        newSet.delete(projectID);
        setOpenReportsReleaseIds((prev) => ({ ...prev, [projectID]: new Set() }));
      } else {
        newSet.add(projectID);
      }
      return newSet;
    });
    setSelectedReportsProjectID(projectID);
    setSelectedReportsReleaseID(null);
    setSelectedReportsRunID(null);
  };

  const handleReportsReleaseMenuClick = (projectID, releaseID) => {
    setOpenReportsReleaseIds((prev) => {
      const prevSet = prev[projectID] || new Set();
      const newSet = new Set(prevSet);
      if (newSet.has(releaseID)) {
        newSet.delete(releaseID);
      } else {
        newSet.add(releaseID);
      }
      return { ...prev, [projectID]: newSet };
    });
    setSelectedReportsProjectID(projectID);
    setSelectedReportsReleaseID(releaseID);
    setSelectedReportsRunID(null);
  };

  const handleReportsRunClick = (projectID, releaseID, runID) => {
    setSelectedReportsProjectID(projectID);
    setSelectedReportsReleaseID(releaseID);
    setSelectedReportsRunID(runID);
  };

  // Only collapse menus when navigating away from their respective pages
  useEffect(() => {
    if (location.pathname !== "/myprojects") {
      setMyProjectsOpen(false);
      setOpenProjectIds(new Set());
      setOpenReleaseIds({});
    }
    if (location.pathname !== "/reports") {
      setReportsOpen(false);
      setOpenReportsProjectIds(new Set());
      setOpenReportsReleaseIds({});
      setSelectedReportsProjectID(null);
      setSelectedReportsReleaseID(null);
      setSelectedReportsRunID(null);
    }
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside className={`sidebar${isCollapsed ? " sidebar-collapsed" : ""}`}>
        <div className="sidebar-header" style={{display: isCollapsed ? 'none' : undefined}}>
          <button
            className="add-project-btn"
            title="Add Project"
            onClick={() => setShowAddModal(true)}
          >
            Add Project
          </button>
        </div>
        <div className="sidebar-content-scroll" style={{display: isCollapsed ? 'none' : undefined}}>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                style={{ fontWeight: 400 }}
              >
                Dashboard
              </NavLink>
            </li>
            {/* My Projects Menu */}
            <li>
              <span
                className={"sidebar-link" + (myProjectsOpen ? " active" : "")}
                style={{ fontWeight: 400 }}
                onClick={handleMyProjectsMenuClick}
                tabIndex={0}
                role="button"
                aria-expanded={myProjectsOpen}
              >
                My Projects
              </span>
              {myProjectsOpen && location.pathname === "/myprojects" && (
                <ul className="sidebar-myprojects-list">
                  {loadingProjects ? (
                    <li className="sidebar-submenu-loading">Loading...</li>
                  ) : projects.length === 0 ? (
                    <li className="sidebar-submenu-empty">No projects</li>
                  ) : (
                    projects.map((proj) => (
                      <li
                        key={proj.projectID}
                        className="sidebar-myprojects-item"
                        onClick={e => {
                          e.stopPropagation();
                          handleProjectMenuClick(proj.projectID);
                        }}
                        onContextMenu={e => handleProjectRightClick(e, proj)}
                      >
                        <div>
                          {ICONS.folder}
                          <span style={{ flex: 1 }}>{proj.projectName}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '1em', color: '#888' }}>
                            {openProjectIds.has(proj.projectID) ? "▾" : "▸"}
                          </span>
                        </div>
                        {openProjectIds.has(proj.projectID) && releasesByProject[proj.projectID] && (
                          <ul className="sidebar-releases-list">
                            {releasesByProject[proj.projectID].map(rel => (
                              <li
                                key={rel.releaseID}
                                className="sidebar-release-item"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleReleaseMenuClick(proj.projectID, rel.releaseID);
                                }}
                                onContextMenu={e => handleReleaseRightClick(e, rel, proj)}
                              >
                                <div>
                                  {ICONS.release}
                                  <span style={{ flex: 1 }}>{rel.releaseName}</span>
                                  <span style={{ marginLeft: 'auto', fontSize: '1em', color: '#888' }}>
                                    {openReleaseIds[proj.projectID]?.has(rel.releaseID) ? "▾" : "▸"}
                                  </span>
                                </div>
                                {openReleaseIds[proj.projectID]?.has(rel.releaseID) && runsByRelease[rel.releaseID] && (
                                  <ul className="sidebar-runs-list">
                                    {runsByRelease[rel.releaseID].map(run => (
                                      <li
                                        key={run.runID}
                                        className="sidebar-run-item"
                                        onClick={e => {
                                          e.stopPropagation();
                                          onRunClick && onRunClick(run);
                                        }}
                                      >
                                        {ICONS.run}
                                        <span>{run.runName}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
            {/* Reports Menu - Replicated structure, but NO right click/context menu */}
            <li>
              <span
                className={"sidebar-link" + (reportsOpen ? " active" : "")}
                style={{ fontWeight: 400 }}
                onClick={handleReportsMenuClick}
                tabIndex={0}
                role="button"
                aria-expanded={reportsOpen}
              >
                Reports
              </span>
              {reportsOpen && location.pathname === "/reports" && (
                <ul className="sidebar-myprojects-list">
                  {loadingProjects ? (
                    <li className="sidebar-submenu-loading">Loading...</li>
                  ) : projects.length === 0 ? (
                    <li className="sidebar-submenu-empty">No projects</li>
                  ) : (
                    projects.map((proj) => (
                      <li
                        key={proj.projectID}
                        className="sidebar-myprojects-item"
                        onClick={e => {
                          e.stopPropagation();
                          handleReportsProjectMenuClick(proj.projectID);
                        }}
                      >
                        <div>
                          {ICONS.folder}
                          <span style={{ flex: 1 }}>{proj.projectName}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '1em', color: '#888' }}>
                            {openReportsProjectIds.has(proj.projectID) ? "▾" : "▸"}
                          </span>
                        </div>
                        {openReportsProjectIds.has(proj.projectID) && releasesByProject[proj.projectID] && (
                          <ul className="sidebar-releases-list">
                            {releasesByProject[proj.projectID].map(rel => (
                              <li
                                key={rel.releaseID}
                                className="sidebar-release-item"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleReportsReleaseMenuClick(proj.projectID, rel.releaseID);
                                }}
                              >
                                <div>
                                  {ICONS.release}
                                  <span style={{ flex: 1 }}>{rel.releaseName}</span>
                                  <span style={{ marginLeft: 'auto', fontSize: '1em', color: '#888' }}>
                                    {openReportsReleaseIds[proj.projectID]?.has(rel.releaseID) ? "▾" : "▸"}
                                  </span>
                                </div>
                                {openReportsReleaseIds[proj.projectID]?.has(rel.releaseID) && runsByRelease[rel.releaseID] && (
                                  <ul className="sidebar-runs-list">
                                    {runsByRelease[rel.releaseID].map(run => (
                                      <li
                                        key={run.runID}
                                        className="sidebar-run-item"
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleReportsRunClick(proj.projectID, rel.releaseID, run.runID);
                                        }}
                                        style={{
                                          background:
                                            selectedReportsProjectID === proj.projectID &&
                                            selectedReportsReleaseID === rel.releaseID &&
                                            selectedReportsRunID === run.runID
                                              ? "#f0f0f0"
                                              : undefined,
                                          cursor: "pointer"
                                        }}
                                      >
                                        {ICONS.run}
                                        <span>{run.runName}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          </ul>
        </div>
        {/* Always render footer and collapse button */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={handleCollapseClick}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? "⮞" : "⮜"}
          </button>
        </div>
        {/* Modals and context menu */}
        <AddProjectModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProject} />
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
            className="sidebar-context-menu custom-context-menu"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              position: "fixed",
              zIndex: 1000,
            }}
          >
            {contextMenu.type === "myprojects-project" && (
              <button className="sidebar-context-menu-option" onClick={handleAddReleaseOption}>
                <span style={{ marginRight: 8, color: "#43a047" }}>{ICONS.release}</span>
                Add Release
              </button>
            )}
            {contextMenu.type === "myprojects-release" && (
              <button className="sidebar-context-menu-option" onClick={handleAddRunOption}>
                <span style={{ marginRight: 8, color: "#ff9800" }}>{ICONS.run}</span>
                Add Test Run
              </button>
            )}
          </div>
        )}
      </aside>
      {/* Render Reports panel to the right of sidebar if a run is selected in Reports menu */}
      {location.pathname === "/reports" && selectedReportsProjectID && selectedReportsReleaseID && selectedReportsRunID && (
        <div style={{ flex: 1, background: "#fff", padding: 24, overflow: "auto" }}>
          <Reports
            selectedProjectID={selectedReportsProjectID}
            selectedReleaseID={selectedReportsReleaseID}
            selectedRunID={selectedReportsRunID}
          />
        </div>
      )}
    </div>
  );
}

export default Sidebar;