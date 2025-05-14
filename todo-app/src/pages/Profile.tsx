import { useState, useEffect, createContext, useContext } from 'react';
import Tasks from './Tasks'; // Add this import for the Tasks component


interface ProfileContextType {
  taskStats: { easy: number; medium: number; hard: number };
  globalStats: { completed: number; failed: number };
  updateTaskStats: (difficulty: 'easy' | 'medium' | 'hard') => void;
  updateGlobalStats: (result: 'completed' | 'failed') => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Хук для использования контекста профиля
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

function Profile() {
  const savedUsername = localStorage.getItem('username');
  const savedExperience = localStorage.getItem('experience');

  const [username, setUsername] = useState(savedUsername || 'Иван');
  const [experience, setExperience] = useState(savedExperience ? Number(savedExperience) : 150);
  const [taskStats, setTaskStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [globalStats, setGlobalStats] = useState({ completed: 0, failed: 0 });


   // Загрузка из localStorage при монтировании
  useEffect(() => {
    const storedTaskStats = JSON.parse(localStorage.getItem('taskStats') || '{"easy":0,"medium":0,"hard":0}');
    const storedGlobalStats = JSON.parse(localStorage.getItem('globalStats') || '{"completed":0,"failed":0}');
    setTaskStats(storedTaskStats);
    setGlobalStats(storedGlobalStats);
  }, []);

   // Сохранение в localStorage при обновлении
  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('experience', experience.toString());
    localStorage.setItem('taskStats', JSON.stringify(taskStats));
    localStorage.setItem('globalStats', JSON.stringify(globalStats));
  }, [username, experience, taskStats, globalStats]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };


  const updateTaskStats = (difficulty: 'easy' | 'medium' | 'hard') => {
    setTaskStats((prev) => {
      const updated = { ...prev, [difficulty]: prev[difficulty] + 1 };
      return updated;
    });
  };

  const updateGlobalStats = (result: 'completed' | 'failed') => {
    setGlobalStats((prev) => {
      const updated = { ...prev, [result]: prev[result] + 1 };
      return updated;
    });
  };

  return (
    <ProfileContext.Provider value={{ taskStats, globalStats, updateTaskStats, updateGlobalStats }}>
      <div style={{ padding: '1rem' }}>
        <h2>Профиль</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Введите имя"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Опыт:</label>
          <p>{experience} опыта</p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h4>📊 Прогресс по задачам:</h4>
          <p>✅ Выполнено задач: {globalStats.completed}</p>
          <p>Легких задач: {taskStats.easy}</p>
          <p>Средних задач: {taskStats.medium}</p>
          <p>Сложных задач: {taskStats.hard}</p>
          <p>❌ Провалено задач: {globalStats.failed}</p>
        </div>
      </div>
    </ProfileContext.Provider>
  );
}

export default Profile;
