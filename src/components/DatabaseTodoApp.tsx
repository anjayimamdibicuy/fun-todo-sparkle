import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckCircle, History, LogOut, Plus, Target, Trash2 } from 'lucide-react';
import { useDatabase, type DatabaseTodo, type DatabaseUser } from '@/hooks/useDatabase';
import AddTodoModal from './AddTodoModal';
import EnhancedMandatoryChecklist from './EnhancedMandatoryChecklist';
import NotificationSystem from './NotificationSystem';
import ConfirmDialog from './ConfirmDialog';
import { toast } from '@/hooks/use-toast';

interface DatabaseTodoAppProps {
  user: DatabaseUser;
  onLogout: () => void;
  onShowHistory: () => void;
}

const DatabaseTodoApp: React.FC<DatabaseTodoAppProps> = ({ user, onLogout, onShowHistory }) => {
  const [todos, setTodos] = useState<DatabaseTodo[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; todo?: DatabaseTodo }>({ isOpen: false });
  const [isLoading, setIsLoading] = useState(true);
  
  // Pass the user to useDatabase hook
  const { getTodos, addTodo, toggleTodo, deleteTodo, logout, generateMandatoryTodos } = useDatabase(user);

  const loadTodos = async () => {
    console.log('Loading todos for user:', user.name);
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayTodos = await getTodos(today);
      console.log('Loaded todos:', todayTodos);
      setTodos(todayTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data todos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted for user:', user.name);
    loadTodos();
    
    // Generate mandatory todos at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    console.log('Time until midnight:', timeUntilMidnight, 'ms');
    
    const midnightTimer = setTimeout(() => {
      console.log('Midnight reached, generating mandatory todos');
      generateMandatoryTodos(user.name);
      loadTodos();
      
      // Set up daily interval
      const dailyInterval = setInterval(() => {
        console.log('Daily interval triggered');
        generateMandatoryTodos(user.name);
        loadTodos();
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [user.name]);

  const handleAddTodo = async (text: string) => {
    console.log('Adding new todo:', text);
    try {
      const newTodo = await addTodo(text);
      if (newTodo) {
        console.log('Todo added successfully:', newTodo);
        setTodos(prev => [...prev, newTodo]);
        toast({
          title: "✅ Kegiatan Ditambahkan!",
          description: "Semangat menyelesaikannya! 💪",
        });
      } else {
        console.log('Failed to add todo');
        toast({
          title: "Error",
          description: "Gagal menambahkan kegiatan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    console.log('Toggling todo:', id, 'to completed:', completed);
    try {
      const success = await toggleTodo(id, completed);
      if (success) {
        console.log('Todo toggled successfully');
        setTodos(prev => prev.map(todo => 
          todo.id === id 
            ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : undefined }
            : todo
        ));
        
        if (completed) {
          toast({
            title: "🎉 Amazing! Kegiatan Selesai!",
            description: "Kamu luar biasa! Keep going! ✨",
          });
        }
      } else {
        console.log('Failed to toggle todo');
        toast({
          title: "Error",
          description: "Gagal mengupdate kegiatan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.todo) return;
    
    console.log('Deleting todo:', deleteConfirm.todo.id);
    try {
      const success = await deleteTodo(deleteConfirm.todo.id);
      if (success) {
        console.log('Todo deleted successfully');
        setTodos(prev => prev.filter(todo => todo.id !== deleteConfirm.todo!.id));
        toast({
          title: "🗑️ Kegiatan Dihapus",
          description: "Kegiatan telah dihapus dari list",
        });
      } else {
        console.log('Failed to delete todo');
        toast({
          title: "Error",
          description: "Gagal menghapus kegiatan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
    
    setDeleteConfirm({ isOpen: false });
  };

  const handleLogout = () => {
    console.log('Logging out');
    logout();
    onLogout();
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const getProgressPercentage = () => {
    return todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
  };

  const getMotivationMessage = () => {
    const percentage = getProgressPercentage();
    if (percentage === 100) return "🏆 Perfect! Kamu amazing hari ini!";
    if (percentage >= 75) return "🌟 Hampir selesai! Keren banget!";
    if (percentage >= 50) return "💪 Good progress! Terus semangat!";
    if (percentage >= 25) return "🚀 Nice start! Ayo lanjutkan!";
    return "✨ Fresh start! Let's do this!";
  };

  const customTodos = todos.filter(todo => !todo.is_mandatory);
  const mandatoryTodos = todos.filter(todo => todo.is_mandatory);

  console.log('Render state:', {
    totalTodos: todos.length,
    mandatoryTodos: mandatoryTodos.length,
    customTodos: customTodos.length,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient p-4">
      <NotificationSystem userName={user.name} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center space-x-2">
              <Target className="w-8 h-8 text-white animate-bounce" />
              <span>Hi, {user.name}! 👋</span>
            </h1>
            <p className="text-white/80 mt-2">{formatDate()}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onShowHistory}
              variant="outline"
              className="glass-modern border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105"
            >
              <History className="w-5 h-5 mr-2" />
              History
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="glass-modern border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="glass-modern border-0 shadow-xl mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center space-x-2">
              <Target className="w-7 h-7 text-white animate-pulse" />
              <span>Progress Hari Ini</span>
            </CardTitle>
            <CardDescription className="text-lg text-white/80">
              {getMotivationMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-white">
                {completedCount} dari {todos.length} kegiatan selesai
              </span>
              <span className="text-3xl font-bold text-white animate-pulse">
                {getProgressPercentage()}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 h-4 rounded-full transition-all duration-1000 ease-out animate-pulse"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Mandatory Checklist */}
        <EnhancedMandatoryChecklist todos={todos} onToggleTodo={handleToggleTodo} />

        {/* Add Todo Button */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 border-0 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-bounce"
          >
            <Plus className="w-6 h-6 mr-2" />
            Tambah Kegiatan Custom ✨
          </Button>
        </div>

        {/* Custom Todo List */}
        {customTodos.length > 0 && (
          <Card className="glass-modern border-0 shadow-xl mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Kegiatan Custom 📝 ({customTodos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-xl transition-all duration-500 transform hover:scale-102 ${
                    todo.completed 
                      ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80 animate-scale-in' 
                      : 'bg-white/80 hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={todo.id}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleTodo(todo.id, !todo.completed)}
                      className="w-6 h-6 rounded-full data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-500 data-[state=checked]:border-pink-500 transition-all duration-300"
                    />
                    
                    <div className="flex-1">
                      <label
                        htmlFor={todo.id}
                        className={`text-lg font-medium cursor-pointer transition-all duration-300 ${
                          todo.completed
                            ? 'text-green-700 line-through opacity-75'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.text}
                      </label>
                      {todo.completed && (
                        <div className="flex items-center space-x-2 mt-2 animate-fade-in">
                          <CheckCircle className="w-4 h-4 text-green-500 animate-bounce" />
                          <span className="text-sm text-green-600">
                            Done! Awesome job! 🎉✨
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => setDeleteConfirm({ isOpen: true, todo })}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all duration-300 transform hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {customTodos.length === 0 && (
          <Card className="glass-modern border-0 shadow-xl text-center py-16 animate-fade-in">
            <CardContent>
              <Calendar className="w-20 h-20 text-white/60 mx-auto mb-6 animate-bounce" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Belum Ada Kegiatan Custom
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Fokus dulu sama checklist wajib, atau tambah kegiatan custom! 🌟
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 border-0 rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Kegiatan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kegiatan?"
        description="Yakin mau hapus kegiatan ini? Nggak bisa dibalikin lho! 🥺"
        todoText={deleteConfirm.todo?.text}
      />
    </div>
  );
};

export default DatabaseTodoApp;
