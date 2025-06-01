import React, { useState, useEffect } from "react";
import "../styles.css";

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
  xp: number;
  level: number;
  totalEarnedCoins: number;
  totalEarnedXp: number;
  purchases: number;
}

const Profile: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    completed: { easy: 0, medium: 0, hard: 0 },
    failed: { easy: 0, medium: 0, hard: 0 },
    totalCoins: 0,
    xp: 0,
    level: 1,
    totalEarnedCoins: 0,
    totalEarnedXp: 0,
    purchases: 0,
  });
  const [userName, setUserName] = useState("Имя пользователя");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Загрузка данных пользователя из Telegram
  const tg = (window as any).Telegram.WebApp;
  React.useEffect(() => {
    tg.ready();
    const user = tg.initDataUnsafe.user;
    if (user) {
      setUserName(user.first_name + (user.last_name ? " " + user.last_name : ""));
      if (user.photo_url) {
        setAvatarUrl(user.photo_url);
      }
      // Регистрация пользователя в бэкенде
      fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id.toString(),
          username: user.first_name + (user.last_name ? " " + user.last_name : ""),
        }),
      }).catch(err => console.error('Ошибка регистрации пользователя:', err));
    }
  }, []);

  useEffect(() => {
    const userId = tg.initDataUnsafe.user?.id?.toString();
    if (userId) {
      fetch(`http://localhost:3000/stats/${userId}`)
        .then(response => response.json())
        .then(data => {
          setStats({
            completed: {
              easy: data.completed_easy || 0,
              medium: data.completed_medium || 0,
              hard: data.completed_hard || 0,
            },
            failed: {
              easy: data.failed_easy || 0,
              medium: data.failed_medium || 0,
              hard: data.failed_hard || 0,
            },
            totalCoins: data.total_coins || 0,
            xp: data.xp || 0,
            level: data.level || 1,
            totalEarnedCoins: data.total_earned_coins || 0,
            totalEarnedXp: data.total_earned_xp || 0,
            purchases: data.purchases || 0,
          });
        })
        .catch(err => console.error('Ошибка загрузки статистики:', err));
    }
  }, []);

  const xpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    let totalXp = 0;
    for (let i = 2; i <= level; i++) {
      const tier = Math.floor((i - 1) / 10);
      totalXp += 100 + tier * 50;
    }
    return totalXp;
  };

  const nextLevelXp = (level: number): number => xpForLevel(level + 1);

  const progress = stats.xp > 0
    ? Math.min((stats.xp - xpForLevel(stats.level)) / (nextLevelXp(stats.level) - xpForLevel(stats.level)) * 100, 100)
    : 0;

  const resetStats = () => {
    const userId = tg.initDataUnsafe.user?.id?.toString();
    if (userId) {
      fetch(`http://localhost:3000/stats/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_easy: 0,
          completed_medium: 0,
          completed_hard: 0,
          failed_easy: 0,
          failed_medium: 0,
          failed_hard: 0,
          total_coins: 0,
          xp: 0,
          level: 1,
          total_earned_coins: 0,
          total_earned_xp: 0,
          purchases: 0,
        }),
      })
        .then(() => setStats({
          completed: { easy: 0, medium: 0, hard: 0 },
          failed: { easy: 0, medium: 0, hard: 0 },
          totalCoins: 0,
          xp: 0,
          level: 1,
          totalEarnedCoins: 0,
          totalEarnedXp: 0,
          purchases: 0,
        }))
        .catch(err => console.error('Ошибка сброса статистики:', err));
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <main className="main">
        <div className="profile-header">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Аватар" className="profile-avatar" />
          ) : (
            <div className="avatar"></div>
          )}
          <div>
            <h2>{userName}</h2>
            <div className="level-circle">
              <svg width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#E0E7FF"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#3B82F6"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 - (282.6 * progress / 100)}
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="52"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fill="#000"
                >
                  {stats.level} ур
                </text>
              </svg>
              <div className="xp-text">
                {stats.xp - xpForLevel(stats.level)} XP / {nextLevelXp(stats.level) - xpForLevel(stats.level)} XP
              </div>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <h3>Статистика</h3>
          <div className="stats-section">
            <div>
              <p>Заданий выполнено:</p>
              <p>Лёгких заданий:</p>
              <p>Средних заданий:</p>
              <p>Сложных заданий:</p>
            </div>
            <div>
              <p>{stats.completed.easy + stats.completed.medium + stats.completed.hard}</p>
              <p>{stats.completed.easy}</p>
              <p>{stats.completed.medium}</p>
              <p>{stats.completed.hard}</p>
            </div>
          </div>
          <div className="stats-section">
            <div>
              <p>Заданий провалено:</p>
              <p>Лёгких заданий:</p>
              <p>Средних заданий:</p>
              <p>Сложных заданий:</p>
            </div>
            <div>
              <p>{stats.failed.easy + stats.failed.medium + stats.failed.hard}</p>
              <p>{stats.failed.easy}</p>
              <p>{stats.failed.medium}</p>
              <p>{stats.failed.hard}</p>
            </div>
          </div>
          <div className="stats-section">
            <div>
              <p>Монет заработано:</p>
              <p>Наград куплено:</p>
              <p>Всего очков опыта:</p>
            </div>
            <div>
              <p>{stats.totalEarnedCoins || 0}</p>
              <p>{stats.purchases || 0}</p>
              <p>{stats.totalEarnedXp || 0}</p>
            </div>
          </div>
          <button onClick={resetStats} className="button reset-button">
            Сбросить статистику
          </button>
        </div>
        <div className="stats-card future-section">
          <h3>Визуализация статистики в будущем</h3>
          <p>(Placeholder для графиков)</p>
        </div>
      </main>
    </div>
  );
};

export default Profile;