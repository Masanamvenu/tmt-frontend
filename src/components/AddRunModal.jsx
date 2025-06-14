import React, { useState, useEffect } from "react";
import "./AddRunModal.css";

function AddRunModal({ open, onClose, onSave, releaseName }) {
  const [runName, setRunName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRunName("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!runName.trim()) {
      setError("Run name is required.");
      return;
    }
    onSave(runName.trim());
    setRunName("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="arm-modal-bg">
      <div className="arm-modal">
        <button className="arm-close-btn" onClick={onClose}>×</button>
        <h2>Add Run {releaseName ? `for "${releaseName}"` : ""}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Run Name"
            value={runName}
            onChange={e => {
              setRunName(e.target.value);
              setError("");
            }}
            className="arm-input"
            autoFocus
          />
          {error && <div className="arm-error">{error}</div>}
          <button className="arm-save-btn" type="submit">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRunModal;