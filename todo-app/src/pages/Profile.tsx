import React, { useState, useEffect } from "react";
import '../styles.css';

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

const initialStats: Stats = {
  completed: { easy: 0, medium: 0, hard: 0 },
  failed: { easy: 0, medium: 0, hard: 0 },
  totalCoins: 0,
  xp: 0,
  level: 1,
  totalEarnedCoins: 0,
  totalEarnedXp: 0,
  purchases: 0,
};

// Функция для вычисления XP, необходимого для уровня
const xpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  let totalXp = 0;
  for (let i = 2; i <= level; i++) {
    const tier = Math.floor((i - 1) / 10);
    totalXp += 100 + tier * 50;
  }
  return totalXp;
};

// Функция для вычисления следующего уровня
const nextLevelXp = (level: number): number => xpForLevel(level + 1);

const Profile: React.FC = () => {
  const [stats, setStats] = useState<Stats>(initialStats);
  const userName = "Имя пользователя";

  useEffect(() => {
    const storedStats = localStorage.getItem("stats");
    if (storedStats) {
      const parsedStats: Stats = JSON.parse(storedStats);
      const calculatedLevel = parsedStats.xp >= nextLevelXp(parsedStats.level)
        ? parsedStats.level + 1
        : parsedStats.level;
      setStats({ ...parsedStats, level: calculatedLevel });
    }
  }, []);

  const progress = stats.xp > 0
    ? Math.min((stats.xp - xpForLevel(stats.level)) / (nextLevelXp(stats.level) - xpForLevel(stats.level)) * 100, 100)
    : 0;

  const resetStats = () => {
    localStorage.setItem("stats", JSON.stringify(initialStats));
    localStorage.setItem("rewards", JSON.stringify([]));
    localStorage.setItem("tasks", JSON.stringify([])); // Добавляем сброс задач
    setStats(initialStats);
  };

  return (
    <div>
      <main className="main">
        <div className="profile-header">
          <div className="avatar"></div>
          <div>
            <h2>{userName}</h2>
            <div className="level-circle">
              <svg width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#E0E7FF"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#3B82F6"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="219.8"
                  strokeDashoffset={219.8 - (219.8 * progress / 100)}
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="42"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fill="#000"
                >
                  {stats.level} ур
                </text>
              </svg>
              <div className="xp-text">
                {stats.xp} XP / {nextLevelXp(stats.level)} XP
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