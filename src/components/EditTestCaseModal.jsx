import React, { useState } from "react";
import "./EditTestCaseModal.css";
import { updateTestCaseById } from "../apiutility";

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

const columns = [
  { label: "#", key: "sno" },
  { label: "Test Step", key: "testSteps" },
  { label: "Expected Result", key: "expectedResult" },
  { label: "Actual Result", key: "actualResult" },
  { label: "Locator Type", key: "locatorType" },
  { label: "Locator Value", key: "locatorValue" },
  { label: "Browser Actions", key: "browserActions" },
  { label: "Test Data", key: "testdata" }
];

const emptyStep = {
  testSteps: "",
  expectedResult: "",
  actualResult: "",
  locatorType: "",
  locatorValue: "",
  browserActions: "",
  testdata: ""
};

/**
 * Props:
 *  - testCase: the test case object to edit/add
 *  - onCancel: function to close/cancel editing
 *  - onSave: function(updatedTestCase) called after successful save
 *  - isAdd: (optional) true for Add mode, false/undefined for Edit
 *  - saving: (optional) loading state from parent
 *  - error: (optional) error message from parent
 */
const EditTestCaseModal = ({
  testCase,
  onCancel,
  onSave,
  isAdd = false,
  saving: savingProp,
  error: errorProp
}) => {
  const [testCaseName, setTestCaseName] = useState(testCase.testCaseName || "");
  const [steps, setSteps] = useState(
    Array.isArray(testCase.testSteps) && testCase.testSteps.length > 0
      ? testCase.testSteps.map(step => ({
          testSteps: step.testSteps || step.action || "",
          expectedResult: step.expectedResult || "",
          actualResult: step.actualResult || "",
          locatorType: step.locatorType || "",
          locatorValue: step.locatorValue || "",
          browserActions: Array.isArray(step.browserActions)
            ? (step.browserActions[0] || "")
            : step.browserActions || "",
          testdata: step.testdata || ""
        }))
      : [ { ...emptyStep } ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // External saving/error from parent for Add mode
  const isLoading = typeof savingProp === "boolean" ? savingProp : saving;
  const displayError = errorProp || error;

  const handleStepChange = (idx, key, value) => {
    setSteps(steps =>
      steps.map((step, i) =>
        i === idx ? { ...step, [key]: value } : step
      )
    );
  };

  const handleAddStep = () => setSteps([...steps, { ...emptyStep }]);
  const handleRemoveStep = (idx) => setSteps(steps => steps.filter((_, i) => i !== idx));

  // Always convert browserActions to array for backend
  function toBackendTestSteps(steps) {
    return steps.map(step => ({
      ...step,
      browserActions: step.browserActions
        ? [step.browserActions]
        : []
    }));
  }

  // Save handler: POST if isAdd, PUT otherwise
  const handleSave = async (e) => {
    e.preventDefault();
    if (isAdd) {
      if (onSave) {
        await onSave({
          projectID: testCase.projectID,
          releaseID: testCase.releaseID,
          runID: testCase.runID,
          testCaseName,
          testSteps: toBackendTestSteps(steps)
        });
      }
    } else {
      setSaving(true);
      setError("");
      try {
        // Compose params for updateTestCaseById (PUT)
        const projectID = testCase.projectID;
        const releaseID = testCase.releaseID;
        const runID = testCase.runID;
        const testCaseID = testCase.testCaseID || testCase.testCaseId;
        const payload = {
          projectID,
          releaseID,
          runID,
          testCaseID,
          testCaseName,
          testSteps: toBackendTestSteps(steps),
        };
        const updated = await updateTestCaseById(payload);
        setSaving(false);
        if (onSave) onSave(updated);
      } catch (err) {
        setSaving(false);
        setError(err.message || "Failed to save test case");
      }
    }
  };

  return (
    <div className="etcm-modal-overlay">
      <div className="etcm-modal">
        <div className="etcm-header">
          <h2 className="etcm-title">
            <input
              className="etcm-title-input"
              value={testCaseName}
              onChange={e => setTestCaseName(e.target.value)}
              placeholder="Test Case Name"
              required
            />
          </h2>
          <button className="etcm-close-btn" onClick={onCancel} title="Close">&times;</button>
        </div>
        <form className="etcm-form" onSubmit={handleSave}>
          <div className="etcm-table-modern-outer">
            <div className="etcm-table-modern">
              <div className="etcm-table-modern-row etcm-table-modern-header">
                {columns.map(col => (
                  <div
                    className="etcm-table-modern-cell etcm-table-modern-header-cell"
                    key={col.label}
                  >
                    {col.label}
                  </div>
                ))}
                <div className="etcm-table-modern-cell etcm-table-modern-header-cell" />
              </div>
              {steps.map((step, idx) => (
                <div className="etcm-table-modern-row" key={idx}>
                  <div className="etcm-table-modern-cell">{idx + 1}</div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.testSteps}
                      onChange={e => handleStepChange(idx, "testSteps", e.target.value)}
                      placeholder="Test Step"
                      required
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.expectedResult}
                      onChange={e => handleStepChange(idx, "expectedResult", e.target.value)}
                      placeholder="Expected Result"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.actualResult}
                      onChange={e => handleStepChange(idx, "actualResult", e.target.value)}
                      placeholder="Actual Result"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.locatorType}
                      onChange={e => handleStepChange(idx, "locatorType", e.target.value)}
                      placeholder="Locator Type"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.locatorValue}
                      onChange={e => handleStepChange(idx, "locatorValue", e.target.value)}
                      placeholder="Locator Value"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <select
                      className="etcm-input"
                      value={step.browserActions}
                      onChange={e => handleStepChange(idx, "browserActions", e.target.value)}
                    >
                      <option value="">Select Action</option>
                      {BROWSER_ACTIONS.map(action => (
                        <option value={action} key={action}>{action}</option>
                      ))}
                    </select>
                  </div>
                  <div className="etcm-table-modern-cell">
                    <input
                      className="etcm-input"
                      value={step.testdata}
                      onChange={e => handleStepChange(idx, "testdata", e.target.value)}
                      placeholder="Test Data"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <button
                      type="button"
                      className="etcm-remove-step-btn"
                      onClick={() => handleRemoveStep(idx)}
                      disabled={steps.length <= 1}
                      title="Remove Step"
                    >×</button>
                  </div>
                </div>
              ))}
              <div className="etcm-table-modern-row etcm-table-modern-row-add">
                <div className="etcm-table-modern-cell" colSpan={columns.length + 1}>
                  <button type="button" className="etcm-add-step-btn" onClick={handleAddStep}>
                    + Add Step
                  </button>
                </div>
              </div>
            </div>
          </div>
          {displayError && (
            <div style={{ color: "#d33", marginBottom: 12 }}>{displayError}</div>
          )}
          <div className="etcm-footer-btns">
            <button
              type="button"
              className="etcm-cancel-btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="etcm-save-btn"
              disabled={isLoading}
              style={{ marginLeft: 10 }}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTestCaseModal;