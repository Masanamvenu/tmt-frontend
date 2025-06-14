import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSection from "../components/RightSection";
import TestCaseEditor from "../components/TestCaseEditor";
import TestCaseDisplay from "../components/TestCaseDisplay";
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

function HomePage({ onLogout }) {
  const [selectedRun, setSelectedRun] = useState(null);
  const [testCasesByRun, setTestCasesByRun] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [displayTestCase, setDisplayTestCase] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Add new test case
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

  // Show test case details
  const handleShowTestCase = (testCase) => {
    setDisplayTestCase(testCase);
    setShowEditor(false);
  };

  // Close display panel
  const handleCloseDisplay = () => setDisplayTestCase(null);

  // Edit test case
  const handleEditTestCase = () => setShowEditor(true);

  // Save edits
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

  return (
    <div>
      <Header showLogin={false} onLogout={onLogout} />
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
          {/* The main panel (right), for editor or display */}
          <div className="main-panel">
            {displayTestCase && !showEditor && (
              <TestCaseDisplay
                testCase={displayTestCase}
                runID={selectedRun?.runID} 
                onClose={handleCloseDisplay}
                onEdit={handleEditTestCase}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;