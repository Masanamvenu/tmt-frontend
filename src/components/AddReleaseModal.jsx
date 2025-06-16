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

  const handleSave = () => {
    const trimmedName = releaseName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 16) {
      setError("Name must be 3 to 10 characters.");
      return;
    }
    onSave(trimmedName);
    setReleaseName("");
    setError("");
  };

  const handleClose = () => {
    setReleaseName("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Release {projectName ? `for "${projectName}"` : ""}</h2>
        <input
          type="text"
          placeholder="Enter release name"
          value={releaseName}
          onChange={(e) => {
            setReleaseName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        {error && <div className="error" style={{ color: "red", marginTop: "5px" }}>{error}</div>}
        <div className="modal-actions">
          <button onClick={handleSave} disabled={!releaseName.trim()}>
            Save
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddReleaseModal;
