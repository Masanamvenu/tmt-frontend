import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import RightSection from "../components/RightSection";
import TestCaseDisplay from "../components/TestCaseDisplay";
import EditTestCaseModal from "../components/EditTestCaseModal";
import { updateDependencyVersion } from "../apiutility";
import "./ProjectsPage.css";

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const ProjectsPage = () => {
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPayload, setEditPayload] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dependency version dropdown state
  const [seleniumVersion, setSeleniumVersion] = useState("4.11.0");
  const [testngVersion, setTestngVersion] = useState("7.3.0");
  const [depUpdateStatus, setDepUpdateStatus] = useState("");

  // Handler for dependency version change
  const handleDependencyVersionChange = async (artifactId, version) => {
    if (artifactId === "selenium-java") setSeleniumVersion(version);
    if (artifactId === "testng") setTestngVersion(version);
    setDepUpdateStatus("Updating...");
    try {
      await updateDependencyVersion(artifactId, version);
      setDepUpdateStatus(`${artifactId} version updated!`);
    } catch (err) {
      setDepUpdateStatus(`Failed to update ${artifactId} version`);
    }
    setTimeout(() => setDepUpdateStatus(""), 2000);
  };

  // Handler to open edit modal
  const handleEditTestCase = (testCase) => {
    setEditPayload(testCase);
    setEditModalOpen(true);
  };

  // Handler for saving after edit
  const handleSaveEdit = async (payload) => {
    setEditModalOpen(false);
    setSelectedTestCase(payload); // Optionally update displayed data
  };

  // Handler for deleting test case
  const handleDeleteTestCase = async () => {
    setSelectedTestCase(null); // Hide the right panel
  };

  return (
    <div className="projects-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onRunClick={(run) => {
          setSelectedRun(run);
          setSelectedTestCase(null);
        }}
      />
      <div
        className={`projects-main-content${sidebarCollapsed ? " projects-main-content-collapsed" : ""}`}
        style={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          width: `calc(100vw - ${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px)`,
        }}
      >
        <div className="projects-middle-section">
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {selectedRun ? (
              <RightSection
                run={selectedRun}
                onTestCaseClick={setSelectedTestCase}
                style={{ flex: 1, minHeight: 0, minWidth: 0 }}
              />
            ) : (
              <div style={{ flex: 1, minHeight: 0 }}>
                <h2>Middle Section</h2>
                <p>Select a run in the sidebar to view test cases here.</p>
              </div>
            )}
          </div>
        </div>
        <div className="projects-right-section">
          {/* Dependency Version Dropdowns - right corner */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "16px 24px 0 24px",
              background: "#f6f8fb",
              gap: 24
            }}
          >
            <div>
              <label htmlFor="selenium-version" style={{ fontWeight: 500, marginRight: 8 }}>
                Selenium Version:
              </label>
              <select
                id="selenium-version"
                value={seleniumVersion}
                onChange={e => handleDependencyVersionChange("selenium-java", e.target.value)}
                style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="4.11.0">4.11.0</option>
                <option value="4.10.0">4.10.0</option>
                <option value="4.9.1">4.9.1</option>
                <option value="4.8.3">4.8.3</option>
                <option value="4.7.2">4.7.2</option>
              </select>
            </div>
            <div>
              <label htmlFor="testng-version" style={{ fontWeight: 500, marginRight: 8 }}>
                TestNG Version:
              </label>
              <select
                id="testng-version"
                value={testngVersion}
                onChange={e => handleDependencyVersionChange("testng", e.target.value)}
                style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="7.3.0">7.3.0</option>
                <option value="7.2.0">7.2.0</option>
                <option value="7.1.0">7.1.0</option>
                <option value="7.0.0">7.0.0</option>
              </select>
            </div>
            <span style={{ marginLeft: 16, color: "#1976d2", minWidth: 160 }}>{depUpdateStatus}</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {selectedTestCase ? (
              <>
                <TestCaseDisplay
                  testCase={selectedTestCase}
                  runID={selectedTestCase.runID}
                  projectId={selectedTestCase.projectID}
                  releaseId={selectedTestCase.releaseID}
                  onClose={() => setSelectedTestCase(null)}
                  onEdit={() => handleEditTestCase(selectedTestCase)}
                  onDelete={handleDeleteTestCase}
                  style={{ flex: 1, minHeight: 0, minWidth: 0 }}
                />
                {editModalOpen && (
                  <EditTestCaseModal
                    testCase={editPayload}
                    onCancel={() => setEditModalOpen(false)}
                    onSave={handleSaveEdit}
                    saving={false}
                    error={""}
                  />
                )}
              </>
            ) : (
              <div style={{ flex: 1, minHeight: 0 }}>
                <h2>Right Section</h2>
                <p>Select a test case to see details here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;