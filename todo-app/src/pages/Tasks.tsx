import React, { useState, useEffect } from "react";
import "../styles.css";

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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const [newTask, setNewTask] = useState({ title: "", deadline: "", description: "", difficulty: "easy" as "easy" | "medium" | "hard" });
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeadlinePopup, setShowDeadlinePopup] = useState(false);
  const [expiredTask, setExpiredTask] = useState<Task | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    syncToServer();
  }, [tasks]);

  const tg = (window as any).Telegram?.WebApp;
  useEffect(() => {
    if (!tg) {
      console.error("Telegram WebApp is not available");
      return;
    }
    tg.ready();
    const user = tg.initDataUnsafe.user;
    console.log("Telegram user data:", tg.initDataUnsafe);
    if (user && user.id) {
      setChatId(user.id);
    } else {
      console.log("No user data from Telegram");
    }
  }, []);

  const sendNotification = async (message: string) => {
    if (!chatId) {
      console.log("No chatId available");
      return;
    }

    const botToken = import.meta.env.VITE_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
      const result = await response.json();
      if (!result.ok) {
        console.log("Failed to send notification:", result);
      } else {
        console.log("Notification sent successfully");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const syncToServer = async () => {
    if (!chatId) {
      console.log("Chat ID не доступен, синхронизация отложена");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tasks/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: chatId.toString(), tasks }),
      });
      if (response.ok) {
        console.log("Данные успешно синхронизированы с сервером");
      } else {
        console.log("Синхронизация не удалась, данные остаются в локалке:", await response.text());
      }
    } catch (err) {
      console.log("Сервер недоступен, данные сохранены в локалке:", err);
    }
  };

  const checkDeadlines = () => {
    const now = new Date();
    let taskToAsk: Task | null = null;

    tasks.forEach((task) => {
      if (task.status !== "pending" || !task.deadline) return;

      const deadlineDate = new Date(task.deadline);
      if (now > deadlineDate && !taskToAsk) {
        taskToAsk = task;
        sendNotification(`Дедлайн истёк: задача "${task.title}" просрочена!`);
      }
    });

    if (taskToAsk && !showDeadlinePopup) {
      setExpiredTask(taskToAsk);
      setShowDeadlinePopup(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkDeadlines, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

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
      sendNotification(`Новая задача добавлена: ${newTaskItem.title}${newTaskItem.deadline ? ` (Дедлайн: ${newTaskItem.deadline})` : ""}`);
      return updatedTasks;
    });

    setNewTask({ title: "", deadline: "", description: "", difficulty: "easy" });
    setShowAddPopup(false);
  };

  const markTaskAsCompleted = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as Task["status"] } : t
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      sendNotification(`Задача "${task.title}" выполнена! 🎉`);
      return updatedTasks;
    });

    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.completed[task.difficulty] = (stats.completed[task.difficulty] || 0) + 1;
    stats.totalCoins += task.coins;
    const oldLevel = stats.level;
    const xpReward = task.difficulty === "easy" ? 10 : task.difficulty === "medium" ? 20 : 30;
    stats.xp += xpReward;
    stats.level = calculateLevel(stats.xp);
    stats.totalEarnedCoins = (stats.totalEarnedCoins || 0) + task.coins;
    stats.totalEarnedXp = (stats.totalEarnedXp || 0) + xpReward;

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

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: "failed" as Task["status"] } : t
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      sendNotification(`Задача "${task.title}" провалена. 😞`);
      return updatedTasks;
    });

    const stats = JSON.parse(localStorage.getItem("stats") || JSON.stringify(initialStats));
    stats.failed[task.difficulty] = (stats.failed[task.difficulty] || 0) + 1;
    localStorage.setItem("stats", JSON.stringify(stats));
  };

  const handleDeadlineConfirmation = (completed: boolean) => {
    if (!expiredTask) return;

    if (completed) {
      markTaskAsCompleted(expiredTask.id);
    } else {
      markTaskAsFailed(expiredTask.id);
    }

    setShowDeadlinePopup(false);
    setExpiredTask(null);
    checkDeadlines();
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const failedTasks = tasks.filter((task) => task.status === "failed");

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <main className="main">
        <h2
          onClick={() => setShowPending(!showPending)}
          className="collapsible-header"
        >
          Текущие задачи {showPending ? "▲" : "▼"}
        </h2>
        {showPending && (
          <ul className="task-list">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <li
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
                </li>
              ))
            ) : (
              <li className="empty-message">Нет задач</li>
            )}
          </ul>
        )}
        <h2
          onClick={() => setShowCompleted(!showCompleted)}
          className="collapsible-header"
        >
          Выполненные задачи {showCompleted ? "▲" : "▼"}
        </h2>
        {showCompleted && (
          <ul className="task-list">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
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
              ))
            ) : (
              <li className="empty-message">Нет задач</li>
            )}
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
            {failedTasks.length > 0 ? (
              failedTasks.map((task) => (
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
              ))
            ) : (
              <li className="empty-message">Нет задач</li>
            )}
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

      {/* Попап для подтверждения дедлайна */}
      {showDeadlinePopup && expiredTask && (
        <div className="popup">
          <h2>Дедлайн истёк</h2>
          <p>Время выполнения задачи "{expiredTask.title}" вышло. Успели ли вы выполнить её?</p>
          <button onClick={() => handleDeadlineConfirmation(true)} className="button success-button">
            Да
          </button>
          <button onClick={() => handleDeadlineConfirmation(false)} className="button fail-button">
            Нет
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;