import React from "react";
import "./TestCaseDisplay.css";
import { runTestCase } from "../apiutility"; // Add this import

const columns = [
  { label: "#", render: (_, idx) => idx + 1, className: "dtc-col-sno" },
  { label: "Test Step", render: step => step.testSteps || step.action },
  { label: "Expected Result", render: step => step.expectedResult },
  {
    label: "Browser Actions",
    render: step =>
      Array.isArray(step.browserActions)
        ? step.browserActions.join(", ")
        : step.browserActions || "-"
  },
  { label: "Test Data", render: step => step.testdata }
];

/**
 * Props:
 *  - testCase: the test case object (must have testCaseId or testCaseID and testCaseName)
 *  - onClose
 *  - onEdit
 *  - runID: (required for Run button)
 */
const TestCaseDisplay = ({ testCase, onClose, onEdit, runID }) => {
  // support testCase.testCaseId or testCase.testCaseID (backend may use either)
  const testCaseId = testCase?.testCaseId || testCase?.testCaseID || testCase?.testCaseId?.toString() || testCase?.testCaseID?.toString();
  const [loading, setLoading] = React.useState(false);

  // Show API result
  const [runResult, setRunResult] = React.useState(null);
  // Optional: error handling
  const [runError, setRunError] = React.useState(null);

  if (!testCase) return null;

  const handleRun = async () => {
    if (!runID || !testCaseId) {
      setRunError("Run ID or Test Case ID missing");
      return;
    }
    setLoading(true);
    setRunError(null);
    setRunResult(null);
    try {
      // Call the API function
      const result = await runTestCase({ runID, testCaseIds: [testCaseId] });
      setRunResult(result);
    } catch (e) {
      setRunError(e.message || "Failed to run test case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dtc-modal">
      <div className="dtc-header">
        <h2 className="dtc-title">{testCase.testCaseName}</h2>
        <div className="dtc-controls">
          <button
            className="dtc-run-btn"
            onClick={handleRun}
            disabled={loading}
            style={{ marginRight: 8 }}
          >
            {loading ? "Running..." : "Run"}
          </button>
          <button className="dtc-edit-btn" onClick={onEdit}>Edit</button>
          <button className="dtc-close-btn" onClick={onClose} title="Close">&times;</button>
        </div>
      </div>
      {runError && <div style={{ color: "#d33", marginBottom: 10 }}>{runError}</div>}
      {runResult && (
        <div style={{ color: "#388e3c", fontWeight: 500, marginBottom: 10 }}>
          Run Complete: {typeof runResult === "object" ? JSON.stringify(runResult) : runResult}
        </div>
      )}
      <div className="dtc-table-modern-outer">
        <div className="dtc-table-modern">
          <div className="dtc-table-modern-row dtc-table-modern-header">
            {columns.map(col => (
              <div className="dtc-table-modern-cell dtc-table-modern-header-cell" key={col.label}>
                {col.label}
              </div>
            ))}
          </div>
          {(testCase.testSteps || []).map((step, idx) => (
            <div className="dtc-table-modern-row" key={idx}>
              {columns.map((col, cidx) => (
                <div className="dtc-table-modern-cell" key={cidx}>
                  {col.render(step, idx)}
                </div>
              ))}
            </div>
          ))}
          {(testCase.testSteps || []).length === 0 && (
            <div className="dtc-table-modern-row">
              <div className="dtc-table-modern-cell" colSpan={columns.length} style={{ color: "#888" }}>
                No steps for this test case.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseDisplay;