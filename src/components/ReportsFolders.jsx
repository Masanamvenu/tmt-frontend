import React, { useEffect, useState } from "react";
import { fetchProjects, fetchReleases, fetchRuns } from "../apiutility";
import "./ReportsFolders.css";

export default function ReportsFolders() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function buildTree() {
      setLoading(true);
      setError("");
      try {
        const projects = await fetchProjects();
        const releases = await fetchReleases();
        const runs = await fetchRuns();

        // Build tree: Project -> Release -> Run
        const projectMap = {};
        projects.forEach((p) => {
          projectMap[p.projectID] = { ...p, releases: [] };
        });

        releases.forEach((r) => {
          if (projectMap[r.projectID]) {
            projectMap[r.projectID].releases.push({ ...r, runs: [] });
          }
        });

        // Map releases for quick lookup
        const releaseMap = {};
        Object.values(projectMap).forEach((p) => {
          p.releases.forEach((r) => {
            releaseMap[r.releaseID] = r;
          });
        });

        runs.forEach((run) => {
          if (releaseMap[run.releaseID]) {
            releaseMap[run.releaseID].runs.push(run);
          }
        });

        setTree(Object.values(projectMap));
      } catch (e) {
        setError(e.message || "Failed to load folders");
      }
      setLoading(false);
    }
    buildTree();
  }, []);

  const toggle = (type, id) => {
    setExpanded((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  };

  return (
    <div className="rf-tree-root">
      <h2 className="rf-title">Test Results Folders</h2>
      {loading && <div className="rf-loading">Loading...</div>}
      {error && <div className="rf-error">{error}</div>}
      {!loading && !error && (
        <div>
          {tree.length === 0 && <div className="rf-empty">No projects found.</div>}
          <ul>
            {tree.map((project) => (
              <li key={project.projectID}>
                <div
                  className="rf-folder"
                  onClick={() => toggle("project", project.projectID)}
                >
                  <span className="rf-folder-icon">
                    {expanded[`project-${project.projectID}`] ? "📂" : "📁"}
                  </span>
                  {project.projectName}
                </div>
                {expanded[`project-${project.projectID}`] && (
                  <ul>
                    {project.releases.length === 0 && (
                      <li className="rf-empty">No releases</li>
                    )}
                    {project.releases.map((release) => (
                      <li key={release.releaseID}>
                        <div
                          className="rf-subfolder"
                          onClick={() => toggle("release", release.releaseID)}
                        >
                          <span className="rf-subfolder-icon">
                            {expanded[`release-${release.releaseID}`] ? "📂" : "📁"}
                          </span>
                          {release.releaseName}
                        </div>
                        {expanded[`release-${release.releaseID}`] && (
                          <ul>
                            {release.runs.length === 0 && (
                              <li className="rf-empty">No runs</li>
                            )}
                            {release.runs.map((run) => (
                              <li key={run.runID}>
                                <div className="rf-run">
                                  <span className="rf-run-icon">📄</span>
                                  {run.runName}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}