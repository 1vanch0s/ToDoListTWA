import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import './styles.css';
import Rewards from "./pages/Rewards";

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
  xp: number;
  level: number;
}

const initialStats: Stats = {
  completed: { easy: 0, medium: 0, hard: 0 },
  failed: { easy: 0, medium: 0, hard: 0 },
  totalCoins: 0,
  xp: 0,
  level: 1,
};

const App: React.FC = () => {
  const userName = "Имя пользователя";
  const [coins, setCoins] = useState<number>(0);

  const updateCoins = () => {
    const storedStats = localStorage.getItem("stats");
    if (storedStats) {
      const parsedStats: Stats = JSON.parse(storedStats);
      setCoins(parsedStats.totalCoins || 0);
    }
  };

  useEffect(() => {
    updateCoins();
    window.addEventListener("storage", updateCoins);
    return () => window.removeEventListener("storage", updateCoins);
  }, []);

  return (
    <Router>
      <div>
        <header className="header">
          <div className="user-info">
            <div className="avatar"></div>
            <span>{userName}</span>
          </div>
          <div className="coins">
            <span>{coins} 💰</span>
          </div>
        </header>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
            Задачи
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
            Награды
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-button active" : "nav-button"}>
            Профиль
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Tasks updateCoins={updateCoins} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;