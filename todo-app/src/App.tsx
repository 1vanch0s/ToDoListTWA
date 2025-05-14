import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";

const App: React.FC = () => {
  const userName = "Имя пользователя";
  const coins = 100;

  return (
    <Router>
      <div>
        <header style={{ backgroundColor: "#1E3A8A", color: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "30px", height: "30px", backgroundColor: "#000", borderRadius: "50%", marginRight: "10px" }}></div>
            <span>{userName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{coins} <span style={{ fontSize: "20px" }}>💰</span></span>
          </div>
        </header>
        <nav style={{ backgroundColor: "#93C5FD", padding: "10px", display: "flex", justifyContent: "space-around" }}>
          <NavLink to="/" style={({ isActive }) => ({ color: isActive ? "#1E3A8A" : "#000", fontWeight: isActive ? "bold" : "normal", textDecoration: "none" })}>Задачи</NavLink>
          <NavLink to="/rewards" style={({ isActive }) => ({ color: isActive ? "#1E3A8A" : "#000", fontWeight: isActive ? "bold" : "normal", textDecoration: "none" })}>Награды</NavLink>
          <NavLink to="/profile" style={({ isActive }) => ({ color: isActive ? "#1E3A8A" : "#000", fontWeight: isActive ? "bold" : "normal", textDecoration: "none" })}>Профиль</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;