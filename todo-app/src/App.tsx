import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import './styles.css';

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
  xp: number;
  level: number;
}

const App: React.FC = () => {
  const [coins, setCoins] = useState<number>(0);
  const [userName, setUserName] = useState("Имя пользователя");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

  // Загрузка данных пользователя из Telegram
  const tg = (window as any).Telegram?.WebApp;
  React.useEffect(() => {
    if (!tg) {
      console.error("Telegram WebApp is not available");
      return;
    }
    tg.ready();
    const user = tg.initDataUnsafe.user;
    console.log("Telegram user data:", tg.initDataUnsafe); // Отладка
    if (user) {
      setUserName(user.first_name + (user.last_name ? " " + user.last_name : ""));
      if (user.photo_url) {
        setAvatarUrl(user.photo_url);
      } else {
        console.log("No photo_url available for user");
      }
    } else {
      console.log("No user data from Telegram");
    }
  }, []);

  return (
    <Router>
      <div>
        <header className="header">
          <div className="user-info">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Аватар" className="avatar-image" />
            ) : (
              <div className="avatar"></div>
            )}
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
          <Route path="/rewards" element={<Rewards updateCoins={updateCoins} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;