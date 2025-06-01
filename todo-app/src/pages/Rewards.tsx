import React, { useState, useEffect } from "react";
import "../styles.css";

interface Reward {
  id: number;
  title: string;
  cost: number;
  purchased: boolean;
}

const Rewards: React.FC<{ updateCoins: () => void }> = ({ updateCoins }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [coins, setCoins] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Загрузка данных пользователя из Telegram
  const tg = (window as any).Telegram.WebApp;
  useEffect(() => {
    tg.ready();
    const user = tg.initDataUnsafe.user;
    if (user && user.id) {
      setUserId(user.id.toString());
      // Регистрация пользователя в бэкенде
      fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id.toString(),
          username: user.first_name + (user.last_name ? " " + user.last_name : ""),
        }),
      }).catch(err => console.error('Ошибка регистрации пользователя:', err));
    }
  }, []);

  // Загрузка наград
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/rewards?userId=${userId}`)
      .then(response => response.json())
      .then(data => setRewards(data))
      .catch(err => console.error('Ошибка загрузки наград:', err));
  }, [userId]);

  // Загрузка статистики для получения количества монет
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/stats/${userId}`)
      .then(response => response.json())
      .then(data => setCoins(data.total_coins || 0))
      .catch(err => console.error('Ошибка загрузки статистики:', err));
  }, [userId]);

  const purchaseReward = async (id: number, cost: number) => {
    if (!userId || coins < cost) return;

    try {
      const reward = rewards.find(r => r.id === id);
      if (!reward) return;

      // Обновление награды
      await fetch(`http://localhost:3000/rewards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reward, purchased: true }),
      });

      // Обновление статистики
      const statsResponse = await fetch(`http://localhost:3000/stats/${userId}`);
      let stats = await statsResponse.json();
      stats.total_coins -= cost;
      stats.purchases += 1;

      await fetch(`http://localhost:3000/stats/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });

      setRewards(rewards.map(r => r.id === id ? { ...r, purchased: true } : r));
      setCoins(stats.total_coins);
      updateCoins();
    } catch (err) {
      console.error('Ошибка покупки награды:', err);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <main className="main">
        <h2>Награды</h2>
        <p>Ваши монеты: {coins} 💰</p>
        <ul className="task-list">
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <li key={reward.id} className="task-card reward-card">
                <div>
                  <h3>{reward.title}</h3>
                  <p>Стоимость: {reward.cost} 💰</p>
                </div>
                <button
                  onClick={() => purchaseReward(reward.id, reward.cost)}
                  disabled={reward.purchased || coins < reward.cost}
                  className="button"
                >
                  {reward.purchased ? "Куплено" : "Купить"}
                </button>
              </li>
            ))
          ) : (
            <li className="empty-message">Нет наград</li>
          )}
        </ul>
      </main>
    </div>
  );
};

export default Rewards;