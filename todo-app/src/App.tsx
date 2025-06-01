import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import "./styles.css";

const App: React.FC = () => {
  const [coins, setCoins] = useState<number>(() => {
    const savedStats = localStorage.getItem("stats");
    return savedStats ? JSON.parse(savedStats).totalCoins || 0 : 0;
  });
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      console.error("Telegram WebApp is not available");
      return;
    }
    tg.ready();
    const user = tg.initDataUnsafe.user;
    console.log("Telegram user data:", tg.initDataUnsafe); // Отладка
    if (user && user.id) {
      setChatId(user.id);
      setUserName(user.first_name + (user.last_name ? " " + user.last_name : ""));
      setAvatarUrl(user.photo_url || null);
      if (!localStorage.getItem("isRegistered")) {
        setShowRegisterPopup(true);
      }
    } else {
      console.log("No user data from Telegram");
    }
  }, []);

  const registerUser = async () => {
    if (!chatId || !userName) {
      console.log("Ошибка: chatId или userName отсутствуют", { chatId, userName });
      return;
    }

    console.log("Попытка регистрации пользователя:", { userId: chatId.toString(), username: userName, avatarUrl });
    console.log("API URL:", process.env.REACT_APP_API_URL); // Отладка

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: chatId.toString(),
          username: userName,
          avatarUrl: avatarUrl,
        }),
      });
      const responseData = await response.json(); // Читаем тело ответа
      if (response.ok) {
        console.log("Пользователь успешно зарегистрирован:", responseData);
        localStorage.setItem("isRegistered", "true");
        setShowRegisterPopup(false);
      } else {
        console.error("Ошибка регистрации:", responseData.error || response.statusText);
      }
    } catch (err) {
      console.error("Ошибка при регистрации:", (err as Error).message); // Приведение к Error
    }
  };

  const updateCoins = () => {
    const savedStats = localStorage.getItem("stats");
    const totalCoins = savedStats ? JSON.parse(savedStats).totalCoins || 0 : 0;
    setCoins(totalCoins);
  };

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

        {showRegisterPopup && (
          <div className="popup">
            <h2>Регистрация</h2>
            <p>Разрешите использовать ваше имя и аватар для персонализации?</p>
            <p>Имя: {userName}</p>
            {avatarUrl && <img src={avatarUrl} alt="Аватар" style={{ width: "50px", height: "50px" }} />}
            <button onClick={registerUser} className="button primary-button">
              Разрешить
            </button>
            <button onClick={() => setShowRegisterPopup(false)} className="button close-button">
              Отмена
            </button>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;