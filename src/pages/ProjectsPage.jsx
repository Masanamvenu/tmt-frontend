import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import RightSection from "../components/RightSection";
import TestCaseDisplay from "../components/TestCaseDisplay";
import EditTestCaseModal from "../components/EditTestCaseModal";
import "./ProjectsPage.css";

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const ProjectsPage = () => {
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPayload, setEditPayload] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          <div style={{flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column"}}>
            {selectedRun ? (
              <RightSection
                run={selectedRun}
                onTestCaseClick={setSelectedTestCase}
                style={{flex: 1, minHeight: 0, minWidth: 0}}
              />
            ) : (
              <div style={{flex: 1, minHeight: 0}}>
                <h2>Middle Section</h2>
                <p>Select a run in the sidebar to view test cases here.</p>
              </div>
            )}
          </div>
        </div>
        <div className="projects-right-section">
          <div style={{flex: 1, minHeight: 0, minWidth: 0, display: "flex", flexDirection: "column"}}>
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
                  style={{flex: 1, minHeight: 0, minWidth: 0}}
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
              <div style={{flex: 1, minHeight: 0}}>
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