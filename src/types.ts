export type TaskStatus = 'all' | 'active' | 'done';
export type DayFilter = 'all' | 'today' | 'tomorrow' | 'custom';
export type Tab = 'tasks' | 'list' | 'calendar' | 'profile' | 'settings';

export interface Task {
  id: string;
  text: string;
  done: boolean;
  /** Дата задачи в формате YYYY-MM-DD */
  date: string;
  /** ISO-строка создания */
  createdAt: string;
  /** ISO-строка выполнения (null, если не выполнена) */
  completedAt: string | null;
}

export interface BackupData {
  app: string;
  version: number;
  exportedAt: string;
  tasks: Task[];
}
