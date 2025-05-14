import React, { useEffect, useState } from "react";

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

// Функция для вычисления XP, необходимого для достижения уровня
const xpForLevel = (level: number): number => {
  return level > 1 ? (level - 1) * 100 : 0;
};

// Функция для вычисления уровня на основе XP
const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 50) + 1);
};

const Profile: React.FC = () => {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    const updateStats = () => {
      const storedStats = localStorage.getItem("stats");
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        // Проверяем и исправляем уровень
        const correctedLevel = calculateLevel(parsedStats.xp || 0);
        const correctedStats: Stats = {
          ...parsedStats,
          level: correctedLevel,
        };
        setStats(correctedStats);
        localStorage.setItem("stats", JSON.stringify(correctedStats));
      }
    };

    updateStats();

    // Слушаем изменения в localStorage
    window.addEventListener("storage", updateStats);
    return () => window.removeEventListener("storage", updateStats);
  }, []);

  // Вычисляем общий подсчёт
  const totalCompleted = stats.completed.easy + stats.completed.medium + stats.completed.hard;
  const totalFailed = stats.failed.easy + stats.failed.medium + stats.failed.hard;

  // Вычисляем прогресс для прогресс-бара
  const currentLevelXp = xpForLevel(stats.level); // XP для текущего уровня
  const nextLevelXp = xpForLevel(stats.level + 1); // XP для следующего уровня
  const progressPercent = Math.min(
    ((stats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
    100
  );

  // Функция для сброса статистики
  const resetStats = () => {
    localStorage.setItem("stats", JSON.stringify(initialStats));
    setStats(initialStats);
  };

  return (
    <div>
      <h1>Профиль</h1>
      <h2>Уровень и опыт</h2>
      <p>Текущий уровень: {stats.level}</p>
      <p>Опыт: {stats.xp} / {nextLevelXp} XP</p>
      <div style={{ width: "200px", backgroundColor: "#e0e0e0", borderRadius: "5px" }}>
        <div
          style={{
            width: `${progressPercent}%`,
            maxWidth: "100%", // Предотвращаем выход за границы
            height: "20px",
            backgroundColor: "#4caf50",
            borderRadius: "5px",
          }}
        ></div>
      </div>
      <h2>Статистика</h2>
      <p>Всего выполнено задач: {totalCompleted}</p>
      <p>Выполненные задачи:</p>
      <ul>
        <li>Лёгкие: {stats.completed.easy}</li>
        <li>Средние: {stats.completed.medium}</li>
        <li>Сложные: {stats.completed.hard}</li>
      </ul>
      <p>Всего провалено задач: {totalFailed}</p>
      <p>Проваленные задачи:</p>
      <ul>
        <li>Лёгкие: {stats.failed.easy}</li>
        <li>Средние: {stats.failed.medium}</li>
        <li>Сложные: {stats.failed.hard}</li>
      </ul>
      <p>Всего монет: {stats.totalCoins}</p>
      <button onClick={resetStats} style={{ marginTop: "20px", padding: "10px", backgroundColor: "#ff4444", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        Сбросить статистику
      </button>
    </div>
  );
};

export default Profile;