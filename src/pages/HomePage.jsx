import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSection from "../components/RightSection";
import TestCaseEditor from "../components/TestCaseEditor";
import TestCaseDisplay from "../components/TestCaseDisplay";
import EditTestCaseModal from "../components/EditTestCaseModal";
import { deleteTestCaseByIds } from "../apiutility";
import "./HomePage.css";

const BROWSER_ACTIONS = [
  "OPEN_BROWSER",
  "ENTER_URL",
  "CLOSE_BROWSER",
  "ENTER",
  "WAIT",
  "IMPLICITLYWAIT",
  "EXPLICITWAIT",
  "ISDISPLAYED",
];

function HomePage({ isLoggedIn = true, onLogout }) {
  const navigate = useNavigate(); // <-- add this

  // Wrap onLogout to also navigate to landing
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  const [selectedRun, setSelectedRun] = useState(null);
  const [testCasesByRun, setTestCasesByRun] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [displayTestCase, setDisplayTestCase] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ...rest of your handlers (unchanged)...

  const handleAddTestCase = ({ testCaseName, rows }) => {
    if (!selectedRun) return;
    setTestCasesByRun(prev => {
      const prevList = prev[selectedRun.runID] || [];
      return {
        ...prev,
        [selectedRun.runID]: [
          ...prevList,
          { testCaseName, testSteps: rows }
        ]
      };
    });
    setShowEditor(false);
  };

  const handleShowTestCase = (testCase) => {
    setDisplayTestCase(testCase);
    setShowEditor(false);
  };

  const handleCloseDisplay = () => setDisplayTestCase(null);

  const handleEditTestCase = () => setShowEditModal(true);

  const handleSaveEditModal = (updatedTestCase) => {
    if (!selectedRun || !displayTestCase) return;
    setTestCasesByRun(prev => {
      const list = prev[selectedRun.runID] || [];
      const idx = list.findIndex(tc => tc.testCaseName === displayTestCase.testCaseName);
      if (idx === -1) return prev;
      const updated = [...list];
      updated[idx] = { ...updated[idx], ...updatedTestCase };
      return { ...prev, [selectedRun.runID]: updated };
    });
    setDisplayTestCase(updatedTestCase);
    setShowEditModal(false);
  };

  const handleSaveEdit = ({ testCaseName, rows }) => {
    if (!selectedRun || !displayTestCase) return;
    setTestCasesByRun(prev => {
      const list = prev[selectedRun.runID] || [];
      const idx = list.findIndex(tc => tc.testCaseName === displayTestCase.testCaseName);
      if (idx === -1) return prev;
      const updated = [...list];
      updated[idx] = { ...updated[idx], testCaseName, testSteps: rows };
      return { ...prev, [selectedRun.runID]: updated };
    });
    setDisplayTestCase(null);
    setShowEditor(false);
  };

  const handleDeleteTestCase = async () => {
    if (!selectedRun || !displayTestCase) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteTestCaseByIds(
        selectedRun.projectID,
        selectedRun.releaseID,
        selectedRun.runID,
        displayTestCase.testCaseID || displayTestCase.testCaseId
      );
      setTestCasesByRun(prev => {
        const list = prev[selectedRun.runID] || [];
        const filtered = list.filter(
          tc => (tc.testCaseID || tc.testCaseId) !== (displayTestCase.testCaseID || displayTestCase.testCaseId)
        );
        return { ...prev, [selectedRun.runID]: filtered };
      });
      setDisplayTestCase(null);
    } catch (e) {
      setDeleteError(e.message || "Failed to delete test case");
    }
    setDeleteLoading(false);
  };

  return (
    <div>
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => {}}
        onLogoutClick={handleLogout}
      />
      <div className="hp-layout">
        <Sidebar
          onRunClick={setSelectedRun}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <div
          style={{
            display: "flex",
            flex: 1,
            transition: "all 0.2s"
          }}
        >
          <RightSection
            run={selectedRun}
            testCases={testCasesByRun[selectedRun?.runID] || []}
            onAddTestCase={() => { setShowEditor(true); setDisplayTestCase(null); }}
            onTestCaseClick={handleShowTestCase}
          />
          <div className="main-panel">
            {displayTestCase && !showEditor && (
              <TestCaseDisplay
                testCase={displayTestCase}
                runID={selectedRun?.runID}
                projectId={selectedRun?.projectID}
                releaseId={selectedRun?.releaseID}
                onClose={handleCloseDisplay}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                deleteLoading={deleteLoading}
                deleteError={deleteError}
              />
            )}
            {showEditor && (
              <TestCaseEditor
                browserActions={BROWSER_ACTIONS}
                runID={selectedRun?.runID}
                releaseID={selectedRun?.releaseID}
                projectID={selectedRun?.projectID}
                onSave={displayTestCase ? handleSaveEdit : handleAddTestCase}
                onCancel={() => { setShowEditor(false); setDisplayTestCase(null); }}
                testCase={displayTestCase}
              />
            )}
            {showEditModal && displayTestCase && (
              <EditTestCaseModal
                testCase={displayTestCase}
                onCancel={() => setShowEditModal(false)}
                onSave={handleSaveEditModal}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;