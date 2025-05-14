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
}

const initialStats: Stats = {
  completed: { easy: 0, medium: 0, hard: 0 },
  failed: { easy: 0, medium: 0, hard: 0 },
  totalCoins: 0,
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<"easy" | "medium" | "hard">("easy");

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
      // Миграция старых данных
      const parsedStats = JSON.parse(storedStats);
      if (typeof parsedStats.completed === "number") {
        const migratedStats: Stats = {
          completed: { easy: parsedStats.completed || 0, medium: 0, hard: 0 },
          failed: { easy: parsedStats.failed || 0, medium: 0, hard: 0 },
          totalCoins: parsedStats.totalCoins || 0,
        };
        localStorage.setItem("stats", JSON.stringify(migratedStats));
      }
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
    </div>
  );
};

export default Tasks;