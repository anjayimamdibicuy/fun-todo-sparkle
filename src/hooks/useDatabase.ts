
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DatabaseTodo {
  id: string;
  user_id: string;
  text: string;
  is_mandatory: boolean;
  completed: boolean;
  date: string;
  created_at: string;
  completed_at?: string;
}

export interface DatabaseUser {
  id: string;
  name: string;
  created_at: string;
}

export const useDatabase = () => {
  const [currentUser, setCurrentUser] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setUserContext = async (userName: string) => {
    try {
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user',
        setting_value: userName,
        is_local: true
      });
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  };

  const loginUser = async (name: string): Promise<{ success: boolean; user?: DatabaseUser }> => {
    setIsLoading(true);
    try {
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (!existingUser) {
        return { success: false };
      }

      await setUserContext(name);
      setCurrentUser(existingUser);
      
      // Generate mandatory todos for today
      await generateMandatoryTodos(name);
      
      return { success: true, user: existingUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string): Promise<{ success: boolean; user?: DatabaseUser }> => {
    setIsLoading(true);
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false };
        }
        throw error;
      }

      await setUserContext(name);
      setCurrentUser(newUser);
      
      // Generate mandatory todos for today
      await generateMandatoryTodos(name);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const generateMandatoryTodos = async (userName: string) => {
    try {
      const { error } = await supabase.rpc('generate_mandatory_todos', {
        user_name: userName
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error generating mandatory todos:', error);
    }
  };

  const getTodos = async (date?: string): Promise<DatabaseTodo[]> => {
    if (!currentUser) return [];
    
    try {
      let query = supabase
        .from('todos')
        .select('*')
        .order('is_mandatory', { ascending: false })
        .order('created_at', { ascending: true });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  };

  const addTodo = async (text: string): Promise<DatabaseTodo | null> => {
    if (!currentUser) return null;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          user_id: currentUser.id,
          text,
          is_mandatory: false,
          date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding todo:', error);
      return null;
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', todoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling todo:', error);
      return false;
    }
  };

  const deleteTodo = async (todoId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  };

  const getHistory = async (): Promise<{ date: string; todos: DatabaseTodo[] }[]> => {
    if (!currentUser) return [];

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = (data || []).reduce((acc: Record<string, DatabaseTodo[]>, todo) => {
        const date = todo.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(todo);
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, todos]) => ({ date, todos }));
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return {
    currentUser,
    isLoading,
    loginUser,
    registerUser,
    getTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    getHistory,
    logout,
    generateMandatoryTodos
  };
};
