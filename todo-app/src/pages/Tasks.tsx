import React, { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  status: "pending" | "completed" | "failed";
  coins: number;
  difficulty: "easy" | "medium" | "hard";
}

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

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
    // Инициализация статистики
    const storedStats = localStorage.getItem("stats");
    if (!storedStats) {
      localStorage.setItem("stats", JSON.stringify(initialStats));
    } else {
      // Миграция и проверка данных
      const parsedStats = JSON.parse(storedStats);
      let migratedStats: Stats;
      if (typeof parsedStats.completed === "number") {
        migratedStats = {
          completed: { easy: parsedStats.completed || 0, medium: 0, hard: 0 },
          failed: { easy: parsedStats.failed || 0, medium: 0, hard: 0 },
          totalCoins: parsedStats.totalCoins || 0,
          xp: 0,
          level: 1,
        };
      } else {
        // Проверяем и исправляем уровень на основе XP
        const correctedLevel = calculateLevel(parsedStats.xp || 0);
        migratedStats = {
          ...parsedStats,
          xp: parsedStats.xp || 0,
          level: correctedLevel,
        };
      }
      localStorage.setItem("stats", JSON.stringify(migratedStats));
    }
  }, []);

  const addTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "pending",
      coins: newTaskDifficulty === "easy" ? 10 : newTaskDifficulty === "medium" ? 20 : 30,
      difficulty: newTaskDifficulty,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    setNewTaskTitle("");
  };

  const markTaskAsCompleted = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as const } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // Обновляем статистику
    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.completed[task.difficulty] = (stats.completed[task.difficulty] || 0) + 1;
    stats.totalCoins += task.coins;

    // Начисляем XP и проверяем уровень
    const xpGained = task.difficulty === "easy" ? 10 : task.difficulty === "medium" ? 20 : 30;
    const oldLevel = stats.level;
    stats.xp += xpGained;
    stats.level = calculateLevel(stats.xp);

    if (stats.level > oldLevel) {
      setNewLevel(stats.level);
      setShowLevelUpPopup(true);
      setTimeout(() => setShowLevelUpPopup(false), 3000); // Закрываем попап через 3 секунды
    }

    localStorage.setItem("stats", JSON.stringify(stats));
  };

  const markTaskAsFailed = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "failed" as const } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // Обновляем статистику
    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.failed[task.difficulty] = (stats.failed[task.difficulty] || 0) + 1;
    localStorage.setItem("stats", JSON.stringify(stats));
  };

  return (
    <div>
      <h1>Задачи</h1>
      <div>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Новая задача"
        />
        <select
          value={newTaskDifficulty}
          onChange={(e) => setNewTaskDifficulty(e.target.value as "easy" | "medium" | "hard")}
        >
          <option value="easy">Лёгкая</option>
          <option value="medium">Средняя</option>
          <option value="hard">Сложная</option>
        </select>
        <button onClick={addTask}>Добавить</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} ({task.difficulty}) - {task.status}
            {task.status === "pending" && (
              <>
                <button onClick={() => markTaskAsCompleted(task.id)}>Выполнено</button>
                <button onClick={() => markTaskAsFailed(task.id)}>Провалено</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Попап для нового уровня */}
      {showLevelUpPopup && newLevel && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            border: "2px solid #4caf50",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          <h2>Поздравляем!</h2>
          <p>Вы достигли уровня {newLevel}!</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;