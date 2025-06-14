import React, { useState } from "react";
import { saveTestCasesBatch } from "../apiutility";
import "./TestCaseEditor.css";

function TestCaseEditor({
  browserActions = [],
  onSave,
  onCancel,
  runID,
  releaseID,
  projectID,
}) {
  const [testCaseName, setTestCaseName] = useState("");
  const [rows, setRows] = useState(
    Array(5).fill(0).map(() => ({
      testSteps: "",
      expectedResult: "",
      actualResult: "",
      locatorType: "",
      locatorValue: "",
      browserActions: browserActions[0] || "",
      testdata: "",
    }))
  );
  const [saving, setSaving] = useState(false);

  const handleRowChange = (idx, field, value) => {
    setRows(prev =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      {
        testSteps: "",
        expectedResult: "",
        actualResult: "",
        locatorType: "",
        locatorValue: "",
        browserActions: browserActions[0] || "",
        testdata: "",
      },
    ]);
  };

  const handleSave = async () => {
    if (!testCaseName.trim()) {
      alert("Test Case Name is required!");
      return;
    }
    setSaving(true);

    const filledRows = rows.filter(
      row =>
        Object.entries(row).some(
          ([key, value]) =>
            key !== "browserActions" &&
            typeof value === "string" &&
            value.trim() !== ""
        )
    );

    if (!filledRows.length) {
      setSaving(false);
      alert("Please fill at least one row before saving.");
      return;
    }

    const testSteps = filledRows.map(row => ({
      testSteps: row.testSteps,
      expectedResult: row.expectedResult,
      actualResult: row.actualResult,
      locatorType: row.locatorType,
      locatorValue: row.locatorValue,
      browserActions: [row.browserActions],
      testdata: row.testdata,
    }));

    const payload = {
      projectID,
      releaseID,
      runID,
      testCaseName,
      testSteps,
    };

    try {
      await saveTestCasesBatch(payload);
      setSaving(false);
      if (onSave) onSave({ testCaseName, rows: testSteps });
    } catch (error) {
      setSaving(false);
      alert("Failed to save test cases: " + (error.message || "Unknown error"));
    }
  };

  return (
    <section className="testcase-editor-section">
      <div className="tce-left">
        <label htmlFor="test-case-name" className="tce-label">
          Test Case Name
        </label>
        <input
          id="test-case-name"
          className="tce-input"
          type="text"
          value={testCaseName}
          onChange={e => setTestCaseName(e.target.value)}
          placeholder="Enter test case name"
          disabled={saving}
        />
      </div>
      <div className="tce-right">
        <table className="tce-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Test Steps</th>
              <th>Expected Result</th>
              <th>Actual Result</th>
              <th>Locator Type</th>
              <th>Locator Value</th>
              <th>Browser Actions</th>
              <th>Test Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    value={row.testSteps}
                    onChange={e => handleRowChange(idx, "testSteps", e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.expectedResult}
                    onChange={e => handleRowChange(idx, "expectedResult", e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.actualResult}
                    onChange={e => handleRowChange(idx, "actualResult", e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.locatorType}
                    onChange={e => handleRowChange(idx, "locatorType", e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.locatorValue}
                    onChange={e => handleRowChange(idx, "locatorValue", e.target.value)}
                    disabled={saving}
                  />
                </td>
                <td>
                  <select
                    value={row.browserActions}
                    onChange={e => handleRowChange(idx, "browserActions", e.target.value)}
                    disabled={saving}
                  >
                    {browserActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={row.testdata}
                    onChange={e => handleRowChange(idx, "testdata", e.target.value)}
                    disabled={saving}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tce-btn-row">
          <button className="tce-btn tce-btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="tce-btn tce-btn-secondary" onClick={handleAddRow} disabled={saving}>
            Add Row
          </button>
          <button className="tce-btn tce-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default TestCaseEditor;