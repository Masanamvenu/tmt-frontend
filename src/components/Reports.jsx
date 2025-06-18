import React, { useEffect, useState } from "react";
import {
  fetchProjects,
  fetchReleases,
  fetchRuns,
} from "../apiutility";
import "./Reports.css"; // <-- Add this line

/**
 * Props:
 * - selectedProjectID: string | number
 * - selectedReleaseID: string | number
 * - selectedRunID: string | number
 */
function Reports({ selectedProjectID, selectedReleaseID, selectedRunID }) {
  const [project, setProject] = useState(null);
  const [release, setRelease] = useState(null);
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        let proj = null, rel = null, rn = null;

        if (selectedProjectID) {
          const projects = await fetchProjects();
          proj = projects.find(p => String(p.projectID) === String(selectedProjectID));
        }
        if (selectedReleaseID) {
          const releases = await fetchReleases();
          rel = releases.find(r => String(r.releaseID) === String(selectedReleaseID));
        }
        if (selectedRunID) {
          const runs = await fetchRuns();
          rn = runs.find(r => String(r.runID) === String(selectedRunID));
        }

        if (isMounted) {
          setProject(proj || null);
          setRelease(rel || null);
          setRun(rn || null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [selectedProjectID, selectedReleaseID, selectedRunID]);

  if (loading) {
    return <div className="reports-panel">Loading Test Execution Results...</div>;
  }

  if (!project || !release || !run) {
    return (
      <div className="reports-panel">
        <h3>Test Execution Results</h3>
        <div>Please select a Project, Release, and Test Run from the Reports menu.</div>
      </div>
    );
  }

  return (
    <div className="reports-panel">
      <h3>Test Execution Results</h3>
      <div>
        <strong>Project:</strong> {project.projectName}
      </div>
      <div>
        <strong>Release:</strong> {release.releaseName}
      </div>
      <div>
        <strong>Test Run:</strong> {run.runName}
      </div>
      <div style={{ marginTop: 16, color: "#888" }}>
        {/* Placeholder for actual test execution data */}
        Test execution details will appear here.
      </div>
    </div>
  );
}

export default Reports;