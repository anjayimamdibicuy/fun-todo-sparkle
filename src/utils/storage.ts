
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyTodos {
  date: string;
  todos: Todo[];
  userName: string;
}

export const STORAGE_KEYS = {
  CURRENT_USER: 'todo_current_user',
  DAILY_TODOS: 'todo_daily_todos',
  HISTORY: 'todo_history'
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (name: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, name);
};

export const getTodaysTodos = (): Todo[] => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`${STORAGE_KEYS.DAILY_TODOS}_${today}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveTodaysTodos = (todos: Todo[]): void => {
  const today = new Date().toDateString();
  localStorage.setItem(`${STORAGE_KEYS.DAILY_TODOS}_${today}`, JSON.stringify(todos));
};

export const getHistory = (): DailyTodos[] => {
  const history: DailyTodos[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEYS.DAILY_TODOS)) {
      const data = localStorage.getItem(key);
      if (data) {
        const todos = JSON.parse(data);
        const date = key.replace(`${STORAGE_KEYS.DAILY_TODOS}_`, '');
        if (todos.length > 0) {
          history.push({
            date,
            todos,
            userName: getCurrentUser() || 'Unknown'
          });
        }
      }
    }
  }
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
