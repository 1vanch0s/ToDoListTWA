import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import axios from "axios"; // Добавлена для HTTP-запросов
import "./styles.css";

// Существующий код остается без изменений
const App: React.FC = () => {
  const [coins, setCoins] = useState<number>(() => {
    const savedStats = localStorage.getItem("stats");
    return savedStats ? JSON.parse(savedStats).totalCoins || 0 : 0;
  });
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Новые состояния для авторизации через логин/пароль
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [user, setUser] = useState<{ id: number; username: string; email: string } | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "", username: "" });

  // Функция для отправки логов на сервер (существующая)
  const sendLogToServer = async (message: string) => {
    const apiUrl = process.env.REACT_APP_API_URL || "undefined";
    console.log("API URL:", apiUrl); // Добавь этот лог в консоль браузера
    try {
        const logUrl = `${apiUrl}/log`;
        const logBody = JSON.stringify({ message });
        await fetch(logUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: logBody,
        });
        // Лог успешной отправки
        await fetch(logUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Лог успешно отправлен: ${message}` }),
        });
    } catch (err) {
        const apiUrl = process.env.REACT_APP_API_URL || "undefined";
        await fetch(`${apiUrl}/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Ошибка отправки лога: ${(err as Error).message}` }),
        }).catch(() => {});
    }
};

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      sendLogToServer("Telegram WebApp is not available");
      return;
    }
    tg.ready();
    const user = tg.initDataUnsafe.user;
    sendLogToServer(`Telegram user data: ${JSON.stringify(tg.initDataUnsafe)}`);
    if (user && user.id) {
      setChatId(user.id);
      setUserName(user.first_name + (user.last_name ? " " + user.last_name : ""));
      setAvatarUrl(user.photo_url || null);
      if (!localStorage.getItem("isRegistered")) {
        setShowRegisterPopup(true);
        sendLogToServer("Попап регистрации отображен");
      }
    } else {
      sendLogToServer("No user data from Telegram");
    }
  }, []);

  const registerUser = async () => {
    sendLogToServer("Функция registerUser вызвана");
    if (!chatId || !userName) {
      sendLogToServer(`Ошибка: chatId или userName отсутствуют, chatId: ${chatId}, userName: ${userName}`);
      return;
    }

    sendLogToServer(`Попытка регистрации пользователя: userId=${chatId}, username=${userName}, avatarUrl=${avatarUrl}`);
    sendLogToServer(`API URL: ${process.env.REACT_APP_API_URL}`);

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
      const responseData = await response.json();
      if (response.ok) {
        sendLogToServer(`Пользователь успешно зарегистрирован: ${JSON.stringify(responseData)}`);
        localStorage.setItem("isRegistered", "true");
        setShowRegisterPopup(false);
      } else {
        sendLogToServer(`Ошибка регистрации: ${responseData.error || response.statusText}`);
      }
    } catch (err) {
      sendLogToServer(`Ошибка при регистрации: ${(err as Error).message}`);
    }
  };

  const handleAllowClick = () => {
    sendLogToServer("Кнопка 'Разрешить' нажата");
    registerUser();
  };

  // Новая функция для обработки ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Новая функция для регистрации через логин/пароль
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      });
      setUser(response.data);
      setShowSignupPopup(false);
      sendLogToServer(`Регистрация успешна для ${credentials.email}`);
    } catch (err) {
      console.error("Signup error:", err);
      sendLogToServer(`Ошибка регистрации: ${(err as Error).message}`);
      alert("Registration failed");
    }
  };

  // Новая функция для входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        email: credentials.email,
        password: credentials.password,
      });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setShowLoginPopup(false);
      sendLogToServer(`Вход выполнен для ${credentials.email}`);
    } catch (err) {
      console.error("Login error:", err);
      sendLogToServer(`Ошибка входа: ${(err as Error).message}`);
      alert("Login failed");
    }
  };

  // Новая функция для выхода
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    sendLogToServer("Пользователь вышел");
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
            {/* Новый блок для отображения данных пользователя после входа через логин/пароль */}
            {user && <span> | {user.username} (Email: {user.email})</span>}
          </div>
          <div className="coins">
            <span>{coins} 💰</span>
          </div>
          {/* Новая кнопка выхода, если авторизован */}
          {isAuthenticated && <button onClick={handleLogout}>Выйти</button>}
        </header>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-button active" : "nav-button")}>
            Задачи
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => (isActive ? "nav-button active" : "nav-button")}>
            Награды
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-button active" : "nav-button")}>
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
            <h2>Регистрация (Telegram)</h2>
            <p>Разрешите использовать ваше имя и аватар для персонализации?</p>
            <p>Имя: {userName}</p>
            {avatarUrl && <img src={avatarUrl} alt="Аватар" style={{ width: "50px", height: "50px" }} />}
            <button onClick={handleAllowClick} onTouchStart={handleAllowClick} className="button primary-button">
              Разрешить
            </button>
            <button onClick={() => setShowRegisterPopup(false)} className="button close-button">
              Отмена
            </button>
          </div>
        )}

        {/* Новый попап для входа */}
        {showLoginPopup && (
          <div className="popup">
            <h2>Вход</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={credentials.email}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
              />
              <button type="submit" className="button primary-button">
                Войти
              </button>
              <button onClick={() => setShowLoginPopup(false)} className="button close-button">
                Закрыть
              </button>
            </form>
          </div>
        )}

        {/* Новый попап для регистрации */}
        {showSignupPopup && (
          <div className="popup">
            <h2>Регистрация</h2>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={credentials.username}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={credentials.email}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
              />
              <button type="submit" className="button primary-button">
                Зарегистрироваться
              </button>
              <button onClick={() => setShowSignupPopup(false)} className="button close-button">
                Закрыть
              </button>
            </form>
          </div>
        )}

        {/* Новая кнопка для открытия попапов, если не авторизован */}
        {!isAuthenticated && !showRegisterPopup && (
          <div className="auth-buttons">
            <button onClick={() => setShowLoginPopup(true)}>Войти</button>
            <button onClick={() => setShowSignupPopup(true)}>Зарегистрироваться</button>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;