import React, { useEffect, useState } from "react";

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
}

const initialStats: Stats = {
  completed: { easy: 0, medium: 0, hard: 0 },
  failed: { easy: 0, medium: 0, hard: 0 },
  totalCoins: 0,
};

const Profile: React.FC = () => {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    const updateStats = () => {
      const storedStats = localStorage.getItem("stats");
      if (storedStats) {
        setStats(JSON.parse(storedStats));
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

  return (
    <div>
      <h1>Профиль</h1>
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
    </div>
  );
};

export default Profile;