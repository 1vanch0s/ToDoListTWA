import { useState, useEffect } from 'react';
import type { Reward } from '../types/Reward'; // Импортируем типы для награды

// Страница наград
function Rewards() {
  const saved_rewards = localStorage.getItem('rewards');
  const initial_rewards: Reward[] = saved_rewards ? JSON.parse(saved_rewards) : [];

  // Фильтруем пустые или некорректные награды, если нужно
  const validRewards = initial_rewards.filter((reward: Reward) => reward.title && reward.cost > 0);

  // Состояние для списка наград
  const [rewards, setRewards] = useState<Reward[]>(validRewards);

  // Состояние для валюты пользователя
  const [currency, setCurrency] = useState<number>(() => {
    const saved = localStorage.getItem('coins');
    return saved ? parseInt(saved) : 0;
  }); 
  useEffect(() => {
  localStorage.setItem('coins', currency.toString());
}, [currency]);
  
  // Состояние для ввода новой награды
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(0);

  useEffect(() => {
    // Сохраняем награды в localStorage
    localStorage.setItem('rewards', JSON.stringify(rewards));
  }, [rewards]);

  // Функция для добавления новой награды
  const addReward = () => {
    if (newRewardTitle.trim() === '' || newRewardCost <= 0) return;

    const newReward: Reward = {
      id: new Date().toISOString(),
      title: newRewardTitle,
      cost: newRewardCost,
    };

    setRewards((prev) => [...prev, newReward]);
    setNewRewardTitle('');
    setNewRewardCost(0);
  };

  // Функция для трат валюты на награду
  const spendCurrency = (reward: Reward) => {
    if (currency >= reward.cost) {
      setCurrency(currency - reward.cost);
      // Можете добавить логику для отслеживания потраченных наград, если нужно
      alert(`Вы потратили ${reward.cost} на ${reward.title}`);
    } else {
      alert('Недостаточно валюты для покупки этой награды');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Награды</h2>

      {/* Форма добавления награды */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={newRewardTitle}
          onChange={(e) => setNewRewardTitle(e.target.value)}
          placeholder="Название награды"
        />
        <input
          type="number"
          value={newRewardCost}
          onChange={(e) => setNewRewardCost(Number(e.target.value))}
          placeholder="Стоимость"
        />
        <button onClick={addReward}>Добавить награду</button>
      </div>

      {/* Отображаем текущие награды */}
      <div>
        <h3>Ваш баланс: {currency} монет</h3>
        <ul>
          {rewards.map((reward) => (
            <li key={reward.id} style={{ marginBottom: '0.5rem' }}>
              {reward.title} - {reward.cost} монет
              <button onClick={() => spendCurrency(reward)} style={{ marginLeft: '1rem' }}>
                Потратить
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Rewards;
