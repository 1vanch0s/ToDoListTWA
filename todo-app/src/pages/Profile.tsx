import { useState, useEffect, createContext, useContext} from 'react';
import type {ReactNode} from 'react'
import Tasks from './Tasks';

interface ProfileContextType {
  taskStats: { easy: number; medium: number; hard: number };
  updateTaskStats: (difficulty: 'easy' | 'medium' | 'hard') => void;
  completedCount: number;
  failedCount: number;
  updateCompletedFailedCount: (completed: number, failed: number) => void;
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

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const savedUsername = localStorage.getItem('username');
  const savedExperience = localStorage.getItem('experience');
  const savedStatistics = localStorage.getItem('statistics');
  const savedTaskStats = localStorage.getItem('taskStats');
  const savedStats = localStorage.getItem('stats'); // Статистика выполненных и проваленных задач

  const [username, setUsername] = useState(savedUsername || 'Иван');
  const [experience, setExperience] = useState(savedExperience ? Number(savedExperience) : 150);
  const [statistics, setStatistics] = useState(savedStatistics || 'Задачи: 5, Награды: 3');
  const [taskStats, setTaskStats] = useState(savedTaskStats ? JSON.parse(savedTaskStats) : { easy: 0, medium: 0, hard: 0 });
  
  // Статистика выполненных и проваленных задач
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('experience', experience.toString());
    localStorage.setItem('statistics', statistics);
    localStorage.setItem('taskStats', JSON.stringify(taskStats));
    localStorage.setItem('stats', JSON.stringify({ completed: completedCount, failed: failedCount }));
  }, [username, experience, statistics, taskStats, completedCount, failedCount]);

  useEffect(() => {
    // Загрузка статистики с локального хранилища
    const savedStats = JSON.parse(savedStats || '{"completed":0,"failed":0}');
    setCompletedCount(savedStats.completed);
    setFailedCount(savedStats.failed);
    const savedTaskStats = JSON.parse(localStorage.getItem('taskStats') || '{"easy":0,"medium":0,"hard":0}');
    setTaskStats(savedTaskStats);
  }, [savedStats]);

  const updateTaskStats = (difficulty: 'easy' | 'medium' | 'hard') => {
    setTaskStats((prevStats) => {
      const updatedStats = { ...prevStats };
      updatedStats[difficulty]++;
      return updatedStats;
    });
  };

  const updateCompletedFailedCount = (completed: number, failed: number) => {
    setCompletedCount(completed);
    setFailedCount(failed);
  };

  return (
    <ProfileContext.Provider value={{
      taskStats, 
      updateTaskStats,
      completedCount, 
      failedCount, 
      updateCompletedFailedCount
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

const Profile: React.FC = () => {
  const { taskStats, completedCount, failedCount } = useProfileContext(); // Доступ к данным контекста

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Профиль</h2>
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
};

export default Profile;
