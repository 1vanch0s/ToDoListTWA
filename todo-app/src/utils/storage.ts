// Типы для удобства и автодополнения
export type TaskStats = {
  easy: number;
  medium: number;
  hard: number;
};

export type GlobalStats = {
  completed: number;
  failed: number;
};

export type ProfileData = {
  username: string;
  experience: number;
  taskStats: TaskStats;
  globalStats: GlobalStats;
};

// Ключи для хранения
const STORAGE_KEYS = {
  username: 'username',
  experience: 'experience',
  taskStats: 'taskStats',
  globalStats: 'stats',
};

// Получить профиль целиком
export function getProfileData(): ProfileData {
  const username = localStorage.getItem(STORAGE_KEYS.username) || 'Иван';
  const experience = Number(localStorage.getItem(STORAGE_KEYS.experience)) || 0;
  const taskStats: TaskStats = JSON.parse(localStorage.getItem(STORAGE_KEYS.taskStats) || '{"easy":0,"medium":0,"hard":0}');
  const globalStats: GlobalStats = JSON.parse(localStorage.getItem(STORAGE_KEYS.globalStats) || '{"completed":0,"failed":0}');

  return {
    username,
    experience,
    taskStats,
    globalStats,
  };
}

// Обновить имя пользователя
export function setUsername(username: string) {
  localStorage.setItem(STORAGE_KEYS.username, username);
}

// Обновить опыт
export function setExperience(exp: number) {
  localStorage.setItem(STORAGE_KEYS.experience, exp.toString());
}

// Обновить статистику задач
export function setTaskStats(stats: TaskStats) {
  localStorage.setItem(STORAGE_KEYS.taskStats, JSON.stringify(stats));
}

// Обновить общую статистику (выполнено / провалено)
export function setGlobalStats(stats: GlobalStats) {
  localStorage.setItem(STORAGE_KEYS.globalStats, JSON.stringify(stats));
}

// Инкремент значений
export function incrementTaskStat(difficulty: keyof TaskStats) {
  const stats = getProfileData().taskStats;
  stats[difficulty]++;
  setTaskStats(stats);
}

export function incrementGlobalStat(type: keyof GlobalStats) {
  const stats = getProfileData().globalStats;
  stats[type]++;
  setGlobalStats(stats);
}
