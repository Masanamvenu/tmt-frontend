import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TestCaseEditor from "../components/TestCaseEditor";
import { fetchProjects, fetchReleases, fetchRuns } from "../apiutility";

export default function Dashboard() {
  // Dynamic lists
  const [projects, setProjects] = useState([]);
  const [releases, setReleases] = useState([]);
  const [runs, setRuns] = useState([]);

  // Selected IDs
  const [selectedProjectID, setSelectedProjectID] = useState("");
  const [selectedReleaseID, setSelectedReleaseID] = useState("");
  const [selectedRunID, setSelectedRunID] = useState("");

  // Fetch projects initially
  useEffect(() => {
    fetchProjects().then(setProjects);
  }, []);

  // Fetch releases when a project is selected
  useEffect(() => {
    if (selectedProjectID) {
      fetchReleases(selectedProjectID).then(setReleases);
      setSelectedReleaseID(""); // Reset release and run on project change
      setSelectedRunID("");
      setRuns([]);
    }
  }, [selectedProjectID]);

  // Fetch runs when a release is selected
  useEffect(() => {
    if (selectedReleaseID) {
      fetchRuns(selectedReleaseID).then(setRuns);
      setSelectedRunID(""); // Reset run on release change
    }
  }, [selectedReleaseID]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        projects={projects}
        releases={releases}
        runs={runs}
        onProjectSelect={setSelectedProjectID}
        onReleaseSelect={setSelectedReleaseID}
        onRunSelect={setSelectedRunID}
        selectedProjectID={selectedProjectID}
        selectedReleaseID={selectedReleaseID}
        selectedRunID={selectedRunID}
      />
      <div style={{ flex: 1, padding: 30 }}>
        {selectedProjectID && selectedReleaseID && selectedRunID ? (
          <TestCaseEditor
            projectID={selectedProjectID}
            releaseID={selectedReleaseID}
            runID={selectedRunID}
            onSave={data => alert("Saved: " + JSON.stringify(data))}
            onCancel={() => alert("Cancelled")}
          />
        ) : (
          <div>
            <h2>Please select Project, Release, and Run in the sidebar to start editing test cases.</h2>
          </div>
        )}
      </div>
    </div>
  );
}