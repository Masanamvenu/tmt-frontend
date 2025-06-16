import React, { useState } from "react";
import "./AddProjectModal.css"; // Ensure you have basic modal styles

function AddProjectModal({ open, onClose, onAdd }) {
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSave = async () => {
    const trimmedName = projectName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 10) {
      setError("Project name must be between 3 and 10 characters.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(trimmedName);
      setProjectName("");
      setError("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error while adding project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setProjectName("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Project</h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
            setError("");
          }}
          placeholder="Enter project name"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button
            onClick={handleSave}
            disabled={isSubmitting || !projectName.trim()}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;
