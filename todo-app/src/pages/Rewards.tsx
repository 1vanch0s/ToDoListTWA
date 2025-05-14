import React, { useEffect, useState } from "react";

interface Reward {
  id: string;
  name: string;
  cost: number;
}

interface Stats {
  completed: { easy: number; medium: number; hard: number };
  failed: { easy: number; medium: number; hard: number };
  totalCoins: number;
}

const initialStats: Stats = {
  completed: { easy: 0, medium: 0, hard: 0 },
  failed: { easy: 0, medium: 0, hard: 0 },
  totalCoins: 0,
};

const Rewards: React.FC = () => {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardCost, setNewRewardCost] = useState<number>(0);

  useEffect(() => {
    const updateStats = () => {
      const storedStats = localStorage.getItem("stats");
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    };

    const storedRewards = localStorage.getItem("rewards");
    if (storedRewards) {
      setRewards(JSON.parse(storedRewards));
    }

    updateStats();

    window.addEventListener("storage", updateStats);
    return () => window.removeEventListener("storage", updateStats);
  }, []);

  const addReward = () => {
    if (newRewardName.trim() === "" || newRewardCost <= 0) return;

    const newReward: Reward = {
      id: Date.now().toString(),
      name: newRewardName,
      cost: newRewardCost,
    };

    setRewards((prevRewards) => {
      const updatedRewards = [...prevRewards, newReward];
      localStorage.setItem("rewards", JSON.stringify(updatedRewards));
      return updatedRewards;
    });

    setNewRewardName("");
    setNewRewardCost(0);
  };

  const purchaseReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward || stats.totalCoins < reward.cost) return;

    setStats((prevStats) => {
      const updatedStats = { ...prevStats, totalCoins: prevStats.totalCoins - reward.cost };
      localStorage.setItem("stats", JSON.stringify(updatedStats));
      return updatedStats;
    });
  };

  return (
    <div>
      <h1>Награды</h1>
      <div>
        <input
          type="text"
          value={newRewardName}
          onChange={(e) => setNewRewardName(e.target.value)}
          placeholder="Название награды"
        />
        <input
          type="number"
          value={newRewardCost}
          onChange={(e) => setNewRewardCost(Number(e.target.value))}
          placeholder="Стоимость"
          min="0"
        />
        <button onClick={addReward}>Добавить награду</button>
      </div>
      <p>Ваши монеты: {stats.totalCoins}</p>
      <ul>
        {rewards.map((reward) => (
          <li key={reward.id}>
            {reward.name} ({reward.cost} монет)
            <button
              onClick={() => purchaseReward(reward.id)}
              disabled={stats.totalCoins < reward.cost}
            >
              Купить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rewards;