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

  const handleSave = () => {
    const trimmedName = runName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 16) {
      setError("Name must be 3 to 10 characters.");
      return;
    }
    onSave(trimmedName);
    setRunName("");
    setError("");
  };

  const handleClose = () => {
    setRunName("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Run {releaseName ? `for "${releaseName}"` : ""}</h2>
        <input
          type="text"
          placeholder="Enter run name"
          value={runName}
          onChange={(e) => {
            setRunName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        {error && <div className="error" style={{ color: "red", marginTop: "5px" }}>{error}</div>}
        <div className="modal-actions">
          <button onClick={handleSave} disabled={!runName.trim()}>
            Save
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddRunModal;
