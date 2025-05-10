import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';


type Task = {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
};

type Reward = {
  id: number;
  title: string;
  cost: number;
};

type AppContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  return (
    <AppContext.Provider value={{ tasks, setTasks, rewards, setRewards }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
