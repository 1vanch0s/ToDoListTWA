import React, { useState, useEffect } from "react";
import '../styles.css';

interface Task {
  id: string;
  title: string;
  deadline?: string;
  description: string;
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
  if (level <= 1) return 0;
  let totalXp = 0;
  for (let i = 2; i <= level; i++) {
    const tier = Math.floor((i - 1) / 10);
    totalXp += 100 + tier * 50;
  }
  return totalXp;
};

// Функция для вычисления уровня на основе XP
const calculateLevel = (xp: number): number => {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
};

interface TasksProps {
  updateCoins: () => void;
}

const Tasks: React.FC<TasksProps> = ({ updateCoins }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", deadline: "", description: "", difficulty: "easy" as "easy" | "medium" | "hard" });
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
    const storedStats = localStorage.getItem("stats");
    if (storedStats) {
      const parsedStats = JSON.parse(storedStats);
      const migratedStats = {
        ...initialStats,
        ...parsedStats,
        completed: parsedStats.completed || initialStats.completed,
        failed: parsedStats.failed || initialStats.failed,
        totalCoins: parsedStats.totalCoins || initialStats.totalCoins,
        xp: parsedStats.xp || initialStats.xp,
        level: calculateLevel(parsedStats.xp || 0),
      };
      localStorage.setItem("stats", JSON.stringify(migratedStats));
    } else {
      localStorage.setItem("stats", JSON.stringify(initialStats));
    }
  }, []);

  const addTask = () => {
    if (newTask.title.trim() === "") return;

    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      deadline: newTask.deadline || "",
      description: newTask.description,
      status: "pending",
      coins: newTask.difficulty === "easy" ? 10 : newTask.difficulty === "medium" ? 20 : 30,
      difficulty: newTask.difficulty,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTaskItem];
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    setNewTask({ title: "", deadline: "", description: "", difficulty: "easy" });
    setShowAddPopup(false);
  };

  const markTaskAsCompleted = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as Task["status"] } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.completed[task.difficulty] = (stats.completed[task.difficulty] || 0) + 1;
    stats.totalCoins += task.coins;
    const oldLevel = stats.level;
    stats.xp += task.difficulty === "easy" ? 10 : task.difficulty === "medium" ? 20 : 30;
    stats.level = calculateLevel(stats.xp);

    if (stats.level > oldLevel) {
      setNewLevel(stats.level);
      setShowLevelUpPopup(true);
      setTimeout(() => setShowLevelUpPopup(false), 3000);
    }

    localStorage.setItem("stats", JSON.stringify(stats));
    updateCoins();
  };

  const markTaskAsFailed = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "failed" as Task["status"] } : t
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.failed[task.difficulty] = (stats.failed[task.difficulty] || 0) + 1;
    localStorage.setItem("stats", JSON.stringify(stats));
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const failedTasks = tasks.filter((task) => task.status === "failed");

  return (
    <div>
      <main className="main">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => { setSelectedTask(task); setShowDetailPopup(true); }}
            className="task-card"
          >
            <div>
              <h3>{task.title}</h3>
              {task.deadline && (
                <div className="task-meta">
                  <span>⏰ {task.deadline}</span>
                </div>
              )}
              <div className="task-meta">
                Сложность: {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
              </div>
            </div>
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); markTaskAsFailed(task.id); }}
                className="button fail-button"
              >
                Провалено
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); markTaskAsCompleted(task.id); }}
                className="button success-button"
              >
                Сделано
              </button>
            </div>
          </div>
        ))}
        <h2
          onClick={() => setShowCompleted(!showCompleted)}
          className="collapsible-header"
        >
          Выполненные задачи {showCompleted ? "▲" : "▼"}
        </h2>
        {showCompleted && (
          <ul className="task-list">
            {completedTasks.map((task) => (
              <li
                key={task.id}
                onClick={() => { setSelectedTask(task); setShowDetailPopup(true); }}
                className="task-card completed-task"
              >
                <div>
                  <h3>{task.title} ({task.difficulty}) - {task.status}</h3>
                  {task.deadline && (
                    <div className="task-meta">
                      <span>⏰ {task.deadline}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <h2
          onClick={() => setShowFailed(!showFailed)}
          className="collapsible-header"
        >
          Проваленные задачи {showFailed ? "▲" : "▼"}
        </h2>
        {showFailed && (
          <ul className="task-list">
            {failedTasks.map((task) => (
              <li
                key={task.id}
                onClick={() => { setSelectedTask(task); setShowDetailPopup(true); }}
                className="task-card failed-task"
              >
                <div>
                  <h3>{task.title} ({task.difficulty}) - {task.status}</h3>
                  {task.deadline && (
                    <div className="task-meta">
                      <span>⏰ {task.deadline}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <button
        onClick={() => setShowAddPopup(true)}
        className="add-button"
      >
        +
      </button>

      {/* Попап для добавления задачи */}
      {showAddPopup && (
        <div className="popup">
          <h2>Добавить задачу</h2>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Название"
            className="popup-input"
          />
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            className="popup-input"
            placeholder="Дедлайн (опционально)"
          />
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Описание"
            className="popup-textarea"
          />
          <select
            value={newTask.difficulty}
            onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value as "easy" | "medium" | "hard" })}
            className="popup-select"
          >
            <option value="easy">Лёгкая</option>
            <option value="medium">Средняя</option>
            <option value="hard">Сложная</option>
          </select>
          <button onClick={addTask} className="button primary-button">
            Добавить
          </button>
          <button onClick={() => setShowAddPopup(false)} className="button close-button">
            Закрыть
          </button>
        </div>
      )}

      {/* Попап с подробной информацией */}
      {showDetailPopup && selectedTask && (
        <div className="popup">
          <h2>{selectedTask.title}</h2>
          {selectedTask.deadline && <p><strong>Дедлайн:</strong> {selectedTask.deadline}</p>}
          <p><strong>Сложность:</strong> {selectedTask.difficulty.charAt(0).toUpperCase() + selectedTask.difficulty.slice(1)}</p>
          <p><strong>Описание:</strong> {selectedTask.description || "Нет описания"}</p>
          <button onClick={() => setShowDetailPopup(false)} className="button close-button">
            Закрыть
          </button>
        </div>
      )}

      {/* Попап для нового уровня */}
      {showLevelUpPopup && newLevel && (
        <div className="popup">
          <h2>Поздравляем!</h2>
          <p>Вы достигли уровня {newLevel}!</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;