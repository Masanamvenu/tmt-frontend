import React, { useState, useEffect } from "react";
import "./AddTestCaseModal.css";

function AddTestCaseModal({ open, onClose, onSave, browserActions }) {
  const [fields, setFields] = useState({
    testCaseName: "",
    testSteps: "",
    expectedResult: "",
    actualResult: "",
    locatorType: "",
    locatorValue: "",
    browserActions: browserActions[0] || "",
    testdata: "",
  });

  useEffect(() => {
    if (open) {
      setFields({
        testCaseName: "",
        testSteps: "",
        expectedResult: "",
        actualResult: "",
        locatorType: "",
        locatorValue: "",
        browserActions: browserActions[0] || "",
        testdata: "",
      });
    }
  }, [open, browserActions]);

  const handleChange = e => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!fields.testCaseName.trim()) return;
    onSave({ ...fields, id: Date.now() });
  };

  if (!open) return null;

  return (
    <div className="armodal-bg">
      <div className="armodal">
        <button className="armodal-close-btn" onClick={onClose}>×</button>
        <h2>Add Test Case</h2>
        <form onSubmit={handleSubmit}>
          <div className="armodal-row">
            <input
              type="text"
              name="testCaseName"
              placeholder="Test Case Name"
              value={fields.testCaseName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="testSteps"
              placeholder="Test Steps"
              value={fields.testSteps}
              onChange={handleChange}
            />
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="expectedResult"
              placeholder="Expected Result"
              value={fields.expectedResult}
              onChange={handleChange}
            />
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="actualResult"
              placeholder="Actual Result"
              value={fields.actualResult}
              onChange={handleChange}
            />
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="locatorType"
              placeholder="Locator Type"
              value={fields.locatorType}
              onChange={handleChange}
            />
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="locatorValue"
              placeholder="Locator Value"
              value={fields.locatorValue}
              onChange={handleChange}
            />
          </div>
          <div className="armodal-row">
            <select
              name="browserActions"
              value={fields.browserActions}
              onChange={handleChange}
            >
              {browserActions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="armodal-row">
            <input
              type="text"
              name="testdata"
              placeholder="Test Data"
              value={fields.testdata}
              onChange={handleChange}
            />
          </div>
          <button className="armodal-save-btn" type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default AddTestCaseModal;