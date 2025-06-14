import React, { useState, useEffect } from "react";
import "./AddReleaseModal.css";

function AddReleaseModal({ open, onClose, onSave, projectName }) {
  const [releaseName, setReleaseName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReleaseName("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!releaseName.trim()) {
      setError("Release name is required.");
      return;
    }
    onSave(releaseName.trim());
    setReleaseName("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="arm-modal-bg">
      <div className="arm-modal">
        <button className="arm-close-btn" onClick={onClose}>×</button>
        <h2>Add Release {projectName ? `for "${projectName}"` : ""}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Release Name"
            value={releaseName}
            onChange={e => {
              setReleaseName(e.target.value);
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

export default AddReleaseModal;