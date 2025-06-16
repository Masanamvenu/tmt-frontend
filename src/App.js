import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import DashBoardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/projects" element={<HomePage />} />
        <Route path="/myprojects" element={<ProjectsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

