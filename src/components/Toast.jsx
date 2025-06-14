import React, { useEffect } from "react";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: type === "success" ? "#4BB543" : "#FF4F4F",
        color: "#fff",
        padding: "1em 2em",
        borderRadius: "8px",
        zIndex: 10000,
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}
    >
      {message}
    </div>
  );
}

export default Toast;