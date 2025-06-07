
export interface DatabaseTodo {
  id: string;
  user_id: string;
  text: string;
  is_mandatory: boolean;
  completed: boolean;
  date: string;
  created_at: string;
  completed_at?: string;
  image_url?: string;
}

export interface DatabaseUser {
  id: string;
  name: string;
  created_at: string;
}

export interface PublicTodo {
  id: string;
  text: string;
  is_mandatory: boolean;
  completed: boolean;
  date: string;
  created_at: string;
  completed_at?: string;
  image_url?: string;
  user_name: string;
}

export interface TodoComment {
  id: string;
  todo_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}
