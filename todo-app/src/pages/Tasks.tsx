import { useState, useEffect } from 'react';
import type { Task, Difficulty } from '../types/Task';
import { v4 as uuidv4 } from 'uuid';

function Tasks() {
  const savedTasks = localStorage.getItem('tasks');
  const initialTasks = savedTasks ? JSON.parse(savedTasks): [];

  // Фильтруем пустые задачи
  const validTasks = initialTasks.filter((task: Task) => task.title && task.difficulty);

  const [tasks, setTasks] = useState<Task[]>(validTasks);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('easy');

  const [completedTasks, setComplitedTasks] = useState(0);
  const [failedTasks, setFailedTasks] = useState(0);

  const [disappearingTasks, setDisappearingTasks] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTitle,
      difficulty: newDifficulty,
      completed: false,
      failed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setNewDifficulty('easy');
    setShowModal(false);
  };

  const toggleComplete = (id: string) => {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, completed: true } : task
    )
  );

  const stats = JSON.parse(localStorage.getItem('stats') || '{"completed" :0, "failed" :0}');
  localStorage.setItem('stats', JSON.stringify({...stats, completed: stats.completed + 1}))

  setDisappearingTasks((prev) => [...prev, id]);
  setTimeout(() => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setDisappearingTasks((prev) => prev.filter((tid) => tid !== id));
  }, 500); // 500ms = длительность анимации
};

  const markAsFailed = (id: string) => {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, failed: true, completed: false } : task
    )
  );

  const stats = JSON.parse(localStorage.getItem('stats') || '{"completed" :0, "failed" :0}');
  localStorage.setItem('stats', JSON.stringify({...stats, failed: stats.failed + 1}))

  setDisappearingTasks((prev) => [...prev, id]);
  setTimeout(() => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setDisappearingTasks((prev) => prev.filter((tid) => tid !== id));
  }, 500);
};
  
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Задачи</h2>

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`transition-opacity duration-500 ${
              disappearingTasks.includes(task.id) ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              textDecoration: task.completed ? 'line-through' : 'none',
              marginBottom: '0.5rem',
            }}
          >
            {task.title} ({task.difficulty})
            <button onClick={() => toggleComplete(task.id)} style={{ marginLeft: '1rem' }}>
             ✅
            </button>
            <button onClick={() => markAsFailed(task.id)} style={{ marginLeft: '1rem' }}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* Кнопка "+" */}
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {/* Модалка добавления задачи */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Новая задача</h2>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <select
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="easy">Легкая</option>
              <option value="medium">Средняя</option>
              <option value="hard">Сложная</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={addTask}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;



