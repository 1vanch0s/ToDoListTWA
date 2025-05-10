import { useState, useEffect } from 'react';

function Profile() {
  // Попытаться загрузить данные из localStorage, если они есть
  const savedUsername = localStorage.getItem('username');
  const savedExperience = localStorage.getItem('experience');
  const savedStatistics = localStorage.getItem('statistics');

  // Состояния для имени пользователя, опыта и статистики
  const [username, setUsername] = useState(savedUsername || 'Иван');
  const [experience, setExperience] = useState(savedExperience ? Number(savedExperience) : 150);
  const [statistics, setStatistics] = useState(savedStatistics || 'Задачи: 5, Награды: 3');

  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);


  // Эффект для сохранения данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('experience', experience.toString());
    localStorage.setItem('statistics', statistics);
  }, [username, experience, statistics]);

  // Эффект для загрузки реальной статистики задач
  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('stats') || '{"completed":0,"failed":0}');
    setCompletedCount(savedStats.completed);
    setFailedCount(savedStats.failed);
  }, []);

  // Функции для изменения данных
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleStatisticsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatistics(e.target.value);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Профиль</h2>

      {/* Имя пользователя */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Введите имя"
        />
      </div>

      {/* Опыт пользователя */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Опыт:</label>
        <p>{experience} опыта</p>
      </div>

      {/* Автоматическая статистика по задачам */}
      <div style={{ marginTop: '2rem' }}>
        <h4>📊 Прогресс по задачам:</h4>
        <p>✅ Выполнено задач: {completedCount}</p>
        <p>❌ Провалено задач: {failedCount}</p>
      </div>
    </div>
  );
}

export default Profile;
