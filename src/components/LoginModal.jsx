import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apiutility";
function LoginModal({ onClose, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password }); // This returns { token, ... }
      localStorage.setItem("token", data.token);         // <-- Store token here
      navigate("/dashboard")
    } catch (err) {
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="modal-bg">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1em" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5em", marginBottom: "0.7em" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5em" }}
            />
          </div>
          <button className="login-btn" style={{ width: "100%" }} type="submit">
            Sign In
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1em" }}>
          <span>If you do not have an account, please register?</span>
          <br />
          <button
            className="login-btn"
            style={{
              marginTop: "0.8em",
              background: "#4a4e69"
            }}
            onClick={onRegisterClick}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;