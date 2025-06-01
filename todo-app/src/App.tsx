import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Tasks from "./components/Tasks";
import Rewards from "./components/Rewards";
import Profile from "./components/Profile";
import "../styles.css";

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
    if (user && user.id) {
      setChatId(user.id);
      setUserName(user.first_name + (user.last_name ? " " + user.last_name : ""));
      setAvatarUrl(user.photo_url || null);
      if (!localStorage.getItem("isRegistered")) {
        setShowRegisterPopup(true);
      }
    }
  }, []);

  const registerUser = async () => {
    if (!chatId || !userName) return;

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
      if (response.ok) {
        localStorage.setItem("isRegistered", "true");
        setShowRegisterPopup(false);
        console.log("Пользователь зарегистрирован:", { chatId, userName, avatarUrl });
      } else {
        console.error("Ошибка регистрации:", await response.text());
      }
    } catch (err) {
      console.error("Ошибка при регистрации:", err);
    }
  };

  const updateCoins = () => {
    const savedStats = localStorage.getItem("stats");
    const totalCoins = savedStats ? JSON.parse(savedStats).totalCoins || 0 : 0;
    setCoins(totalCoins);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Tasks updateCoins={updateCoins} />} />
          <Route path="/rewards" element={<Rewards updateCoins={updateCoins} />} />
          <Route path="/profile" element={<Profile />} />
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