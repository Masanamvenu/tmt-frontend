import React, { useState } from "react";
import "./AddProjectModal.css";
import { addProject } from "../apiutility";

function AddProjectModal({ open, onClose, onAdd }) {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    try {
      const newProject = await addProject(projectName.trim());
      setProjectName("");
      setError("");
      setLoading(false);
      if (onAdd) onAdd(newProject);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add project");
      setLoading(false);
    }
  };

  return (
    <div className="apm-modal-bg">
      <div className="apm-modal">
        <button
          className="apm-close-btn"
          onClick={onClose}
        >×</button>
        <h2>Add Project</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setError("");
            }}
            className="apm-input"
            autoFocus
            disabled={loading}
          />
          {error && <div className="apm-error">{error}</div>}
          <button
            type="submit"
            className="apm-add-btn"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Project"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;