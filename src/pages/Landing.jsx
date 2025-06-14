import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      <Header onLoginClick={() => setShowLogin(true)} />
      <div className="landing-content">
        <h1>Welcome to the Test Management Tool</h1>
        <p>
          This is a modern web platform powered by MongoDB, SpringBoot and React.<br />
          Please log in to access the dashboard and manage your projects.
        </p>
      </div>
      <Footer />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

export default Landing;