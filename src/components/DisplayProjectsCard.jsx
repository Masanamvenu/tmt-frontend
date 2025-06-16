import React, { useEffect, useState } from "react";
import { fetchReleases, fetchRuns, getTestCases } from "../apiutility";
import "./DisplayProjectsCard.css";

/**
 * Props:
 * - project: {
 *     id, projectID, projectName, createdAt, updatedAt, etc.
 *   }
 * - onClick: function to call when card is clicked (optional)
 */
function DisplayProjectsCard({ project, onClick }) {
  const [releaseCount, setReleaseCount] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [testCaseCount, setTestCaseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCounts() {
      setLoading(true);
      try {
        const [releases, runs, testCases] = await Promise.all([
          fetchReleases(),
          fetchRuns(),
          getTestCases(),
        ]);
        if (!isMounted) return;
        setReleaseCount(
          releases.filter(r => r.projectID === project.projectID).length
        );
        setRunCount(
          runs.filter(r => r.projectID === project.projectID).length
        );
        setTestCaseCount(
          testCases.filter(tc => tc.projectID === project.projectID).length
        );
      } catch (err) {
        // Optionally handle error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [project.projectID]);

  return (
    <div className="dpc-card" onClick={() => onClick && onClick(project)}>
      <div className="dpc-header">
        <div className="dpc-project-icon">
          <span role="img" aria-label="project">📁</span>
        </div>
        <h3 className="dpc-title">{project.projectName}</h3>
      </div>
      <div className="dpc-divider"></div>
      <div className="dpc-stats-row">
        {loading ? (
          <span className="dpc-stat">Loading...</span>
        ) : (
          <>
            <span className="dpc-stat rel">Releases<br /><strong>{releaseCount}</strong></span>
            <span className="dpc-stat run">Runs<br /><strong>{runCount}</strong></span>
            <span className="dpc-stat tcs">Test Cases<br /><strong>{testCaseCount}</strong></span>
          </>
        )}
      </div>
      <div className="dpc-divider"></div>
      <div className="dpc-footer">
        <span className="dpc-projectid">ID: {project.projectID}</span>
        <span className="dpc-date">
          {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
        </span>
      </div>
    </div>
  );
}

export default DisplayProjectsCard;