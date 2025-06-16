import React from "react";
import "./Dashboard.css";

const Dashboard = () => (
  <div className="dashboard-content">
    <h2>Welcome to the Dashboard</h2>
    <ul>
      <li>Quick overview of your projects</li>
      <li>Recent test runs and results</li>
      <li>Statistics and charts</li>
    </ul>
    {/* Add more widgets/stats as needed */}
  </div>
);

export default Dashboard;