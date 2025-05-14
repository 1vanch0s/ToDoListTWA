import React, { useState, useEffect } from "react";
import '../styles.css';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  purchased: boolean; // Оставляем, но не используем для ограничения покупки
}

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
  xp: number;
  level: number;
}

interface RewardsProps {
  updateCoins: () => void;
}

const Rewards: React.FC<RewardsProps> = ({ updateCoins }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newReward, setNewReward] = useState({ title: "", description: "", cost: "" });
  const [showAddPopup, setShowAddPopup] = useState(false);

  useEffect(() => {
    const storedRewards = localStorage.getItem("rewards");
    if (storedRewards) {
      setRewards(JSON.parse(storedRewards));
    } else {
      localStorage.setItem("rewards", JSON.stringify([]));
    }
  }, []);

  const addReward = () => {
    if (newReward.title.trim() === "" || newReward.cost.trim() === "") return;

    const costValue = parseInt(newReward.cost);
    if (isNaN(costValue) || costValue <= 0) return;

    const newRewardItem: Reward = {
      id: Date.now().toString(),
      title: newReward.title,
      description: newReward.description,
      cost: costValue,
      purchased: false,
    };

    setRewards((prevRewards) => {
      const updatedRewards = [...prevRewards, newRewardItem];
      localStorage.setItem("rewards", JSON.stringify(updatedRewards));
      return updatedRewards;
    });

    setNewReward({ title: "", description: "", cost: "" });
    setShowAddPopup(false);
  };

  const purchaseReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    const stats: Stats = JSON.parse(localStorage.getItem("stats") || "{}");
    if (!stats.totalCoins || stats.totalCoins < reward.cost) {
      alert("Недостаточно монет для покупки этой награды!");
      return;
    }

    // Вычитаем стоимость награды из монет
    stats.totalCoins -= reward.cost;
    localStorage.setItem("stats", JSON.stringify(stats));

    // Обновляем монеты в шапке
    updateCoins();
  };

  const deleteReward = (rewardId: string) => {
    const updatedRewards = rewards.filter((r) => r.id !== rewardId);
    setRewards(updatedRewards);
    localStorage.setItem("rewards", JSON.stringify(updatedRewards));
  };

  return (
    <div>
      <main className="main">
        <div className="rewards-grid">
          {rewards.length === 0 ? (
            <p className="empty-message">Нет наград</p>
          ) : (
            rewards.map((reward) => (
              <div key={reward.id} className="reward-card">
                <h3>{reward.title}</h3>
                <p>{reward.description || "Нет описания"}</p>
                <div className="reward-cost">
                  <span>💰 {reward.cost}</span>
                </div>
                <div className="reward-actions">
                  <button
                    onClick={() => purchaseReward(reward.id)}
                    className="button purchase-button"
                  >
                    Купить
                  </button>
                  <button
                    onClick={() => deleteReward(reward.id)}
                    className="button delete-button"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <button
        onClick={() => setShowAddPopup(true)}
        className="add-button"
      >
        +
      </button>

      {/* Попап для добавления награды */}
      {showAddPopup && (
        <div className="popup">
          <h2>Добавить награду</h2>
          <input
            type="text"
            value={newReward.title}
            onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
            placeholder="Название"
            className="popup-input"
          />
          <textarea
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            placeholder="Описание"
            className="popup-textarea"
          />
          <input
            type="number"
            value={newReward.cost}
            onChange={(e) => setNewReward({ ...newReward, cost: e.target.value })}
            placeholder="Стоимость (монеты)"
            className="popup-input"
          />
          <button onClick={addReward} className="button primary-button">
            Добавить
          </button>
          <button onClick={() => setShowAddPopup(false)} className="button close-button">
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
};

export default Rewards;