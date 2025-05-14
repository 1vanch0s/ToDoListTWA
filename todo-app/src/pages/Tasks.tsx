import React, { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  deadline: string;
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

const Tasks: React.FC = () => {
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
    if (!storedStats) {
      localStorage.setItem("stats", JSON.stringify(initialStats));
    } else {
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
    if (newTask.title.trim() === "" || newTask.deadline.trim() === "") return;

    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      deadline: newTask.deadline,
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
      t.id === taskId ? { ...t, status: "completed" } : t
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
  };

  const markTaskAsFailed = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "failed" } : t
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
      <main style={{ padding: "20px", minHeight: "calc(100vh - 100px)" }}>
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => { setSelectedTask(task); setShowDetailPopup(true); }}
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: "15px",
              padding: "15px",
              marginBottom: "15px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ color: "#000", margin: "0 0 5px 0" }}>{task.title}</h3>
              <div style={{ color: "#000", fontSize: "14px" }}>
                <span>⏰ {task.deadline}</span>
              </div>
              <div style={{ color: "#000", fontSize: "14px" }}>Сложность: {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}</div>
            </div>
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); markTaskAsFailed(task.id); }}
                style={{
                  backgroundColor: "#EF4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  marginRight: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EF4444")}
              >
                Провалено
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); markTaskAsCompleted(task.id); }}
                style={{
                  backgroundColor: "#22C55E",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#16A34A")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#22C55E")}
              >
                Сделано
              </button>
            </div>
          </div>
        ))}
        <h2
          onClick={() => setShowCompleted(!showCompleted)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", marginTop: "20px" }}
        >
          Выполненные задачи {showCompleted ? "▲" : "▼"}
        </h2>
        {showCompleted && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {completedTasks.length === 0 ? (
              <li style={{ color: "#666" }}>Нет завершённых задач</li>
            ) : (
              completedTasks.map((task) => (
                <li
                  key={task.id}
                  style={{
                    backgroundColor: "#E0E7FF",
                    borderRadius: "15px",
                    padding: "15px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {task.title} ({task.difficulty}) - {task.status}
                </li>
            ))
            )}
          </ul>
        )}
        <h2
          onClick={() => setShowFailed(!showFailed)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", marginTop: "20px" }}
        >
          Проваленные задачи {showFailed ? "▲" : "▼"}
        </h2>
        {showFailed && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {failedTasks.length === 0 ? (
              <li style={{ color: "#666" }}>Нет проваленных задач</li>
            ) : (
              failedTasks.map((task) => (
                <li
                  key={task.id}
                  style={{
                    backgroundColor: "#E0E7FF",
                    borderRadius: "15px",
                    padding: "15px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {task.title} ({task.difficulty}) - {task.status}
                </li>
              ))
            )}
          </ul>
        )}
      </main>
      <button
        onClick={() => setShowAddPopup(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          backgroundColor: "#3B82F6",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          fontSize: "30px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        +
      </button>

      {/* Попап для добавления задачи */}
      {showAddPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <h2>Добавить задачу</h2>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Название"
            style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
          />
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
          />
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Описание"
            style={{ width: "100%", marginBottom: "10px", padding: "5px", height: "60px" }}
          />
          <select
            value={newTask.difficulty}
            onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value as "easy" | "medium" | "hard" })}
            style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
          >
            <option value="easy">Лёгкая</option>
            <option value="medium">Средняя</option>
            <option value="hard">Сложная</option>
          </select>
          <button
            onClick={addTask}
            style={{ backgroundColor: "#3B82F6", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" }}
          >
            Добавить
          </button>
          <button
            onClick={() => setShowAddPopup(false)}
            style={{ backgroundColor: "#EF4444", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", marginLeft: "10px" }}
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Попап с подробной информацией */}
      {showDetailPopup && selectedTask && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <h2>{selectedTask.title}</h2>
          <p><strong>Дедлайн:</strong> {selectedTask.deadline}</p>
          <p><strong>Сложность:</strong> {selectedTask.difficulty.charAt(0).toUpperCase() + selectedTask.difficulty.slice(1)}</p>
          <p><strong>Описание:</strong> {selectedTask.description || "Нет описания"}</p>
          <button
            onClick={() => setShowDetailPopup(false)}
            style={{ backgroundColor: "#EF4444", color: "#fff", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}
          >
            Закрыть
          </button>
        </div>
      )}

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
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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