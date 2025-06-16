import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Reports from "../components/Reports";
import "./ReportsPage.css";

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const ReportsPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="reports-page">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div
        className={`reports-right-section${sidebarCollapsed ? " reports-right-section-collapsed" : ""}`}
        style={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: "margin-left 0.2s"
        }}
      >
        <Reports />
      </div>
    </div>
  );
};

export default ReportsPage;