export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  failed: boolean;
}
