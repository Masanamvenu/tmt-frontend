import React, { useState, useEffect } from "react";
import { getTestCases, runTestCase } from "../apiutility";
import { fetchTestCaseByIds } from "../apiutility";
import TestCaseDisplay from "./TestCaseDisplay";
import "./RightSection.css";

function RightSection({ run, onAddTestCase, onTestCaseClick }) {
  const [testCases, setTestCases] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    if (!run) {
      setTestCases([]);
      return;
    }
    setLoading(true);
    getTestCases(run.runID)
      .then(allTestCases => {
        const filtered = allTestCases.filter(tc => tc.runID === run.runID);
        setTestCases(filtered);
      })
      .catch(() => setTestCases([]))
      .finally(() => setLoading(false));
  }, [run]);

  useEffect(() => {
    setSelectedIndexes([]);
    setSelectedTestCase(null);
    setDetailsError("");
    setRunResult(null);
    setRunError(null);
  }, [run, testCases]);

  const handleCheckbox = idx => {
    setSelectedIndexes(selected =>
      selected.includes(idx)
        ? selected.filter(i => i !== idx)
        : [...selected, idx]
    );
  };

  // Fetch and display details when a test case is clicked
  const handleTestCaseClick = async (tc) => {
    if (!run || !tc) return;
    setDetailsLoading(true);
    setDetailsError("");
    try {
      const data = await fetchTestCaseByIds(tc.projectID, tc.releaseID, tc.runID, tc.testCaseID);
      setSelectedTestCase(data);
      if (onTestCaseClick) onTestCaseClick(data);
    } catch (err) {
      setDetailsError("Failed to load test case details.");
      setSelectedTestCase(null);
    }
    setDetailsLoading(false);
  };

  const handleCloseDetails = () => {
    setSelectedTestCase(null);
    setDetailsError("");
  };

  const handleEdit = () => {
    // Your custom edit logic (if any)
  };

  // --- RUN BUTTON HANDLER ---
  const handleRunSelected = async () => {
    setRunResult(null);
    setRunError(null);

    if (!run || selectedIndexes.length === 0) {
      setRunError("Please select at least one test case.");
      return;
    }

    const selectedTestCaseIds = selectedIndexes
      .map(idx => testCases[idx]?.testCaseID || testCases[idx]?.testCaseId)
      .filter(Boolean);

    if (selectedTestCaseIds.length === 0) {
      setRunError("No valid test case IDs selected.");
      return;
    }

    setRunLoading(true);
    try {
      const result = await runTestCase({
        runID: run.runID,
        testCaseIds: selectedTestCaseIds
      });
      setRunResult(result);
    } catch (e) {
      setRunError(e.message || "Failed to run selected test cases.");
    } finally {
      setRunLoading(false);
    }
  };

  if (!run) {
    return (
      <section className="right-section right-section-empty">
        <p>Select a Run to view its Test Cases.</p>
      </section>
    );
  }

  return (
    <section className="right-section">
      <div className="rs-header-row">
        {/* --- RUN BUTTON (Left) --- */}
        <button
          className="rs-run-btn"
          onClick={handleRunSelected}
          disabled={runLoading || selectedIndexes.length === 0}
          style={{
            background: "#e2f4e7",
            color: "#18804a",
            fontWeight: 600,
            border: "none",
            borderRadius: 6,
            padding: "7px 18px",
            cursor: runLoading || selectedIndexes.length === 0 ? "not-allowed" : "pointer",
            marginRight: 12
          }}
        >
          {runLoading ? "Running..." : "Run"}
        </button>
        <button
          className="rs-add-btn-circle-small"
          onClick={onAddTestCase}
          title="Add Test Case"
        >
          <span className="rs-add-btn-plus">+</span>
        </button>
      </div>
      <div className="rs-run-label">
        Run: <span className="rs-run-name">{run.runName}</span>
      </div>

      {(runError || runResult) && (
        <div style={{ margin: "8px 0", minHeight: 24 }}>
          {runError && <span style={{ color: "#d33" }}>{runError}</span>}
          {runResult && (
            <span style={{ color: "#388e3c" }}>
              {typeof runResult === "object" ? JSON.stringify(runResult) : runResult}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="rs-no-tc">Loading...</div>
      ) : testCases.length === 0 ? (
        <div className="rs-no-tc">No test cases yet.</div>
      ) : (
        <div className="rs-card-list">
          {testCases.map((tc, idx) => (
            <div
              key={tc.testCaseID || tc.testCaseName + idx}
              className={`rs-tc-card${selectedIndexes.includes(idx) ? " rs-tc-card-selected" : ""}`}
              onClick={() => handleTestCaseClick(tc)}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={selectedIndexes.includes(idx)}
                onChange={e => {
                  e.stopPropagation();
                  handleCheckbox(idx);
                }}
                className="rs-tc-checkbox"
              />
              <span className="rs-tc-name">{tc.testCaseName}</span>
            </div>
          ))}
        </div>
      )}
      {detailsLoading && (
        <div className="rs-details-loading">Loading test case details...</div>
      )}
      {detailsError && (
        <div className="rs-details-error">{detailsError}</div>
      )}
    </section>
  );
}

export default RightSection;