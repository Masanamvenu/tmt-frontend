import React, { useState } from "react";
import { signUpUser } from "../apiutility";

function RegisterModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await signUpUser({ email, password }); // Use state values, not event!
      // Optionally, you can close the modal or show a success message here
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-bg">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "1em" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5em", marginBottom: "0.7em" }}
              name="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5em" }}
              name="password"
            />
          </div>
          <button className="login-btn" style={{ width: "100%" }} type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;