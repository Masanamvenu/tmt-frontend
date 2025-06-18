import React, { useState } from "react";
import "./EditTestCaseModal.css";
import { updateTestCaseById } from "../apiutility";

const BROWSER_ACTIONS = [
  "OPEN_BROWSER", 
  "ENTER_URL", 
  "CLOSE_BROWSER", 
  "ENTER_TEXT", 
  "WAIT",
  "IMPLICITLYWAIT", 
  "EXPLICITWAIT", 
  "ISDISPLAYED",
  "CLICK_WEB_ELEMENT", 
  "NAVIGATION_TO",
  "NAVIGATE_BACK",
  "NAVIGATE_FORWARD",
  "NAVIGATE_REFRESH",
  "RIGHT_CLICK",
  "DOUBLE_CLICK",
  "SELECTBYVISIBILETEXT",
  "SELECTBYINDEX",
  "SELECTBYVALUE",
  "ALERT_WITH_OK",
  "ALERT_CONFIRMBOX_WITH_OK",
  "ALERT_CONFIRMBOX_WITH_CANCEL",
  "MOUSE_HOVER",
];

const LOCATOR_TYPES = [
  "ID", "NAME", "XPATH", "LINKTEXT", "PARTIALLINKTEXT",
  "CSSSELECTOR", "TAGNAME", "CLASSNAME"
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
  testSteps: "", expectedResult: "", actualResult: "",
  locatorType: "", locatorValue: "", browserActions: "", testdata: ""
};

const EditTestCaseModal = ({
  testCase, onCancel, onSave, isAdd = false, saving: savingProp, error: errorProp
}) => {
  const [testCaseName, setTestCaseName] = useState(testCase.testCaseName || "");
  const [steps, setSteps] = useState(
    Array.isArray(testCase.testSteps) && testCase.testSteps.length > 0
      ? testCase.testSteps.map(step => ({
          testSteps: step.testSteps || step.action || "",
          expectedResult: step.expectedResult || "",
          actualResult: step.actualResult || "",
          locatorType: Array.isArray(step.locatorType) ? (step.locatorType[0] || "") : step.locatorType || "",
          locatorValue: step.locatorValue || "",
          browserActions: Array.isArray(step.browserActions) ? (step.browserActions[0] || "") : step.browserActions || "",
          testdata: step.testdata || ""
        }))
      : [{ ...emptyStep }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isLoading = typeof savingProp === "boolean" ? savingProp : saving;
  const displayError = errorProp || error;

  const handleStepChange = (idx, key, value) => {
    setSteps(steps =>
      steps.map((step, i) => i === idx ? { ...step, [key]: value } : step)
    );
  };

  const handleAddStep = () => setSteps([...steps, { ...emptyStep }]);
  const handleRemoveStep = (idx) => setSteps(steps => steps.filter((_, i) => i !== idx));

  const toBackendTestSteps = (steps) => {
    return steps.map(step => ({
      ...step,
      browserActions: step.browserActions ? [step.browserActions] : []
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const hasValidTestStep = steps.some(step =>
      step.testSteps.trim() !== "" && step.expectedResult.trim() !== ""
    );

    if (!hasValidTestStep) {
      setError("Each test step must have both a 'Test Step' and 'Expected Result'.");
      return;
    }

    const hasAnyMissingFields = steps.some(step =>
      step.testSteps.trim() === "" || step.expectedResult.trim() === ""
    );

    if (hasAnyMissingFields) {
      setError("All Test Steps must have a non-empty 'Test Step' and 'Expected Result'.");
      return;
    }

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
        const payload = {
          projectID: testCase.projectID,
          releaseID: testCase.releaseID,
          runID: testCase.runID,
          testCaseID: testCase.testCaseID || testCase.testCaseId,
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
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="etcm-btn" onClick={handleAddStep}>+ Add Step</button>
            <button type="button" className="etcm-btn" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button className="etcm-close-btn" onClick={onCancel}>&times;</button>
          </div>
        </div>

        <form className="etcm-form" onSubmit={handleSave}>
          <div className="etcm-table-wrapper">
            <div className="etcm-table-modern">
              <div className="etcm-table-modern-row etcm-table-modern-header">
                {columns.map(col => (
                  <div className="etcm-table-modern-cell etcm-table-modern-header-cell" key={col.label}>
                    {col.label}
                  </div>
                ))}
                <div className="etcm-table-modern-cell etcm-table-modern-header-cell" />
              </div>
              {steps.map((step, idx) => (
                <div className="etcm-table-modern-row" key={idx}>
                  <div className="etcm-table-modern-cell">{idx + 1}</div>
                  <div className="etcm-table-modern-cell">
                    <textarea
                      className="etcm-textarea"
                      rows={3}
                      value={step.testSteps}
                      onChange={e => handleStepChange(idx, "testSteps", e.target.value)}
                      placeholder="Test Step"
                      required
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <textarea
                      className="etcm-textarea"
                      rows={3}
                      value={step.expectedResult}
                      onChange={e => handleStepChange(idx, "expectedResult", e.target.value)}
                      placeholder="Expected Result"
                      required
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <textarea
                      className="etcm-textarea"
                      rows={3}
                      value={step.actualResult}
                      onChange={e => handleStepChange(idx, "actualResult", e.target.value)}
                      placeholder="Actual Result"
                    />
                  </div>
                  <div className="etcm-table-modern-cell">
                    <select
                      className="etcm-input"
                      value={step.locatorType}
                      onChange={e => handleStepChange(idx, "locatorType", e.target.value)}
                    >
                      <option value="">Select Locator Type</option>
                      {LOCATOR_TYPES.map(type => (
                        <option value={type} key={type}>{type}</option>
                      ))}
                    </select>
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
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {displayError && <div style={{ color: "#d33", marginTop: 12 }}>{displayError}</div>}
        </form>
      </div>
    </div>
  );
};

export default EditTestCaseModal;
