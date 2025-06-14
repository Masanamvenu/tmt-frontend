import React from "react";
import "./TestCaseDisplay.css";
import { runTestCase, fetchRunTestCaseResults, deleteTestCaseByIds } from "../apiutility";

function formatRunDate(dateString) {
  if (!dateString) return "";
  let date;
  date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const match = /^(\d{2})-(\d{2})-(\d{2}), (\d{2})-(\d{2})$/.exec(dateString);
    if (match) {
      const year = "20" + match[3];
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[1], 10);
      const hour = parseInt(match[4], 10);
      const min = parseInt(match[5], 10);
      date = new Date(Date.UTC(year, month, day, hour, min, 0));
    } else {
      return dateString;
    }
  }
  try {
    const options = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    };
    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
    const get = type => parts.find(p => p.type === type)?.value;
    if (!get("weekday") || !get("month") || !get("day") || !get("year")) {
      return date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + " IST";
    }
    return `${get("weekday")} ${get("month")} ${get("day")} ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} IST`;
  } catch (err) {
    console.error("Error formatting date:", err, dateString, date);
    return date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + " IST";
  }
}

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

const TestCaseDisplay = ({
  testCase,
  onClose,
  onEdit,
  onDelete,
  deleteLoading = false,
  deleteError = "",
  runID,
  projectId,
  releaseId
}) => {
  const testCaseId =
    testCase?.testCaseId ||
    testCase?.testCaseID ||
    testCase?.testCaseId?.toString() ||
    testCase?.testCaseID?.toString();
  const [loading, setLoading] = React.useState(false);
  const [localDeleteLoading, setLocalDeleteLoading] = React.useState(false);

  const [runResult, setRunResult] = React.useState(null);
  const [showRunResult, setShowRunResult] = React.useState(false);
  const [runError, setRunError] = React.useState(null);

  // This is the latest persisted result (latest by executedAt)
  const [latestPersistedResult, setLatestPersistedResult] = React.useState(null);
  const [persistedLoading, setPersistedLoading] = React.useState(false);
  const [persistedError, setPersistedError] = React.useState(null);

  React.useEffect(() => {
    async function fetchLatestResult() {
      if (!projectId || !releaseId || !runID || !testCaseId) {
        setLatestPersistedResult(null);
        return;
      }
      setPersistedLoading(true);
      setPersistedError(null);
      try {
        const results = await fetchRunTestCaseResults(
          projectId,
          releaseId,
          runID,
          testCaseId
        );
        if (Array.isArray(results) && results.length > 0) {
          const sorted = [...results].sort((a, b) => {
            const da = new Date(a.executedAt);
            const db = new Date(b.executedAt);
            if (!isNaN(da) && !isNaN(db)) {
              return db - da;
            } else {
              return (b.executedAt || "").localeCompare(a.executedAt || "");
            }
          });
          setLatestPersistedResult(sorted[0]);
        } else {
          setLatestPersistedResult(null);
        }
      } catch (e) {
        setPersistedError("Failed to fetch test status");
        setLatestPersistedResult(null);
      } finally {
        setPersistedLoading(false);
      }
    }
    fetchLatestResult();
  }, [projectId, releaseId, runID, testCaseId, runResult]);

  React.useEffect(() => {
    if (runResult) {
      setShowRunResult(true);
      const timer = setTimeout(() => setShowRunResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [runResult]);

  if (!testCase) return null;

  const handleRun = async () => {
    if (!runID || !testCaseId || !projectId || !releaseId) {
      setRunError("Project ID, Release ID, Run ID, or Test Case ID missing");
      return;
    }
    setLoading(true);
    setRunError(null);
    setRunResult(null);
    try {
      const resultArr = await runTestCase({
        projectId,
        releaseId,
        runId: runID,
        testCaseIds: [testCaseId]
      });
      const thisResult =
        Array.isArray(resultArr) && resultArr.length > 0
          ? resultArr.find(
              r =>
                r.testCaseId === testCaseId ||
                r.testCaseID === testCaseId
            )
          : null;
      setRunResult(thisResult || resultArr[0] || null);
    } catch (e) {
      setRunError(e.message || "Failed to run test case");
    } finally {
      setLoading(false);
    }
  };

  // Local delete logic for standalone use, otherwise prefer parent state update
  const handleDeleteClick = async () => {
    if (onDelete) {
      // Prefer parent delete logic that updates RightSection list
      onDelete();
      return;
    }
    // Fallback: delete directly here (not recommended for state sync)
    if (!projectId || !releaseId || !runID || !testCaseId) return;
    setLocalDeleteLoading(true);
    try {
      await deleteTestCaseByIds(projectId, releaseId, runID, testCaseId);
      if (onClose) onClose();
    } catch (e) {
      alert(e.message || "Failed to delete test case");
    }
    setLocalDeleteLoading(false);
  };

  function renderStatusAndDate(result) {
    if (!result) return null;
    return (
      <span>
        <b>Test Status:</b>{" "}
        <span
          style={{
            color: result.testStatus === "PASS" ? "#388e3c" : "#d33"
          }}
        >
          {result.testStatus}
        </span>
        {" | "}
        <b>Run Date:</b> {formatRunDate(result.executedAt)}
      </span>
    );
  }

  return (
    <div className="dtc-modal">
      <div className="dtc-header">
        <h2 className="dtc-title">{testCase.testCaseName}</h2>
        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            fontSize: "1em",
            minHeight: "2.2em"
          }}
        ></div>
        <div className="dtc-controls">
          <button
            className="dtc-run-btn"
            onClick={handleRun}
            disabled={loading}
            style={{ marginRight: 8 }}
          >
            {loading ? "Running..." : "Run"}
          </button>
          <button className="dtc-edit-btn" onClick={onEdit}>
            Edit
          </button>
          <button
            className="dtc-delete-btn"
            onClick={handleDeleteClick}
            disabled={deleteLoading || localDeleteLoading}
            style={{
              marginLeft: 8,
              background: "#fde6e6",
              color: "#b71c1c",
              border: "none",
              borderRadius: 4,
              padding: "2px 9px",
              cursor: deleteLoading || localDeleteLoading ? "not-allowed" : "pointer"
            }}
            title="Delete"
          >
            {deleteLoading || localDeleteLoading ? "Deleting..." : "🗑️"}
          </button>
          <button
            className="dtc-close-btn"
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
        {deleteError && (
          <div style={{ color: "#d33", marginTop: 8 }}>{deleteError}</div>
        )}
      </div>
      {runError && (
        <div style={{ color: "#d33", marginBottom: 10 }}>{runError}</div>
      )}
      <div style={{ marginBottom: 10 }}>
        {persistedLoading ? (
          <span style={{ color: "#888" }}>Loading test status...</span>
        ) : persistedError ? (
          <span style={{ color: "#d33" }}>{persistedError}</span>
        ) : latestPersistedResult ? (
          renderStatusAndDate(latestPersistedResult)
        ) : (
          <span style={{ color: "#888" }}>No run status found.</span>
        )}
      </div>
      {runResult && showRunResult && (
        <div
          style={{
            color: runResult.testStatus === "PASS" ? "#388e3c" : "#d33",
            fontWeight: 500,
            marginBottom: 10
          }}
        >
          Run Complete: Test Status: <b>{runResult.testStatus}</b>
          {runResult.runId && (
            <>
              {" "}
              | Run ID: <b>{runResult.runId}</b>
            </>
          )}
          {" | "}
          <b>Run Date:</b> {formatRunDate(runResult.executedAt)}
        </div>
      )}
      <div className="dtc-table-modern-outer">
        <div className="dtc-table-modern">
          <div className="dtc-table-modern-row dtc-table-modern-header">
            {columns.map(col => (
              <div
                className="dtc-table-modern-cell dtc-table-modern-header-cell"
                key={col.label}
              >
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
              <div
                className="dtc-table-modern-cell"
                colSpan={columns.length}
                style={{ color: "#888" }}
              >
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