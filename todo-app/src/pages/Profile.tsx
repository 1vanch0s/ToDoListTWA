import { useState, useEffect, createContext, useContext } from 'react';
import Tasks from './Tasks'; // Add this import for the Tasks component


interface ProfileContextType {
  taskStats: { easy: number; medium: number; hard: number };
  updateTaskStats: (difficulty: 'easy' | 'medium' | 'hard') => void;
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
  const savedStatistics = localStorage.getItem('statistics');
  const savedTaskStats = localStorage.getItem('taskStats');

  const [username, setUsername] = useState(savedUsername || 'Иван');
  const [experience, setExperience] = useState(savedExperience ? Number(savedExperience) : 150);
  const [statistics, setStatistics] = useState(savedStatistics || 'Задачи: 5, Награды: 3');
  const [taskStats, setTaskStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('experience', experience.toString());
    localStorage.setItem('statistics', statistics);
    localStorage.setItem('taskStats', JSON.stringify(taskStats));
  }, [username, experience, statistics, taskStats]);

  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('stats') || '{"completed":0,"failed":0}');
    setCompletedCount(savedStats.completed);
    setFailedCount(savedStats.failed);
    const savedTaskStats = JSON.parse(localStorage.getItem('taskStats') || '{"easy":0,"medium":0,"hard":0}');
    setTaskStats(savedTaskStats);
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleStatisticsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatistics(e.target.value);
  };

  const updateTaskStats = (difficulty: 'easy' | 'medium' | 'hard') => {
    setTaskStats((prevStats) => {
      const updatedStats = { ...prevStats };
      updatedStats[difficulty]++;
      return updatedStats;
    });
  };

  return (
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
        <p>✅ Выполнено задач: {completedCount}</p>
        <p>Легких задач: {taskStats.easy}</p>
        <p>Средних задач: {taskStats.medium}</p>
        <p>Сложных задач: {taskStats.hard}</p>
        <p>❌ Провалено задач: {failedCount}</p>
      </div>
    </div>
  );
}

export default Profile;
