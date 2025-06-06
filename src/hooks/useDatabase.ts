
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
      const { error } = await supabase.rpc('set_config', {
        setting_name: 'app.current_user',
        setting_value: userName,
        is_local: true
      });
      if (error) {
        console.error('Error setting user context:', error);
        throw error;
      }
      console.log('User context set successfully for:', userName);
    } catch (error) {
      console.error('Error setting user context:', error);
      throw error;
    }
  };

  const loginUser = async (name: string): Promise<{ success: boolean; user?: DatabaseUser }> => {
    setIsLoading(true);
    try {
      console.log('Attempting to login user:', name);
      
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .single();

      console.log('User lookup result:', { existingUser, selectError });

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Database error during login:', selectError);
        throw selectError;
      }

      if (!existingUser) {
        console.log('User not found');
        return { success: false };
      }

      console.log('User found, setting context...');
      await setUserContext(name);
      setCurrentUser(existingUser);
      
      console.log('Generating mandatory todos...');
      await generateMandatoryTodos(name);
      
      console.log('Login successful');
      return { success: true, user: existingUser };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error Login",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string): Promise<{ success: boolean; user?: DatabaseUser }> => {
    setIsLoading(true);
    try {
      console.log('Attempting to register user:', name);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name }])
        .select()
        .single();

      console.log('Registration result:', { newUser, error });

      if (error) {
        if (error.code === '23505') {
          console.log('User already exists');
          return { success: false };
        }
        throw error;
      }

      console.log('User registered, setting context...');
      await setUserContext(name);
      setCurrentUser(newUser);
      
      console.log('Generating mandatory todos...');
      await generateMandatoryTodos(name);
      
      console.log('Registration successful');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error Registrasi",
        description: "Terjadi kesalahan saat registrasi",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const generateMandatoryTodos = async (userName: string) => {
    try {
      console.log('Generating mandatory todos for:', userName);
      const { error } = await supabase.rpc('generate_mandatory_todos', {
        user_name: userName
      });
      if (error) {
        console.error('Error generating mandatory todos:', error);
        throw error;
      }
      console.log('Mandatory todos generated successfully');
    } catch (error) {
      console.error('Error generating mandatory todos:', error);
    }
  };

  const getTodos = async (date?: string): Promise<DatabaseTodo[]> => {
    if (!currentUser) {
      console.log('No current user, returning empty todos');
      return [];
    }
    
    try {
      console.log('Fetching todos for user:', currentUser.name, 'date:', date);
      
      let query = supabase
        .from('todos')
        .select('*')
        .order('is_mandatory', { ascending: false })
        .order('created_at', { ascending: true });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      
      console.log('Todos fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching todos:', error);
        throw error;
      }
      
      console.log('Successfully fetched todos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data todos",
        variant: "destructive"
      });
      return [];
    }
  };

  const addTodo = async (text: string): Promise<DatabaseTodo | null> => {
    if (!currentUser) {
      console.log('No current user for adding todo');
      return null;
    }

    try {
      console.log('Adding todo:', text, 'for user:', currentUser.id);
      
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

      console.log('Add todo result:', { data, error });

      if (error) {
        console.error('Error adding todo:', error);
        throw error;
      }
      
      console.log('Todo added successfully');
      return data;
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan todo",
        variant: "destructive"
      });
      return null;
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean): Promise<boolean> => {
    try {
      console.log('Toggling todo:', todoId, 'to:', completed);
      
      const { error } = await supabase
        .from('todos')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', todoId);

      console.log('Toggle todo result:', { error });

      if (error) {
        console.error('Error toggling todo:', error);
        throw error;
      }
      
      console.log('Todo toggled successfully');
      return true;
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate todo",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTodo = async (todoId: string): Promise<boolean> => {
    try {
      console.log('Deleting todo:', todoId);
      
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      console.log('Delete todo result:', { error });

      if (error) {
        console.error('Error deleting todo:', error);
        throw error;
      }
      
      console.log('Todo deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus todo",
        variant: "destructive"
      });
      return false;
    }
  };

  const getHistory = async (): Promise<{ date: string; todos: DatabaseTodo[] }[]> => {
    if (!currentUser) return [];

    try {
      console.log('Fetching history for user:', currentUser.name);
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: true });

      console.log('History fetch result:', { data, error });

      if (error) {
        console.error('Error fetching history:', error);
        throw error;
      }

      // Group by date
      const grouped = (data || []).reduce((acc: Record<string, DatabaseTodo[]>, todo) => {
        const date = todo.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(todo);
        return acc;
      }, {});

      const result = Object.entries(grouped).map(([date, todos]) => ({ date, todos }));
      console.log('History grouped:', result.length, 'days');
      return result;
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  };

  const logout = () => {
    console.log('Logging out user');
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
