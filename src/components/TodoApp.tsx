
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckCircle, History, LogOut, Plus, Target, Trash2 } from 'lucide-react';
import { getCurrentUser, getTodaysTodos, saveTodaysTodos, generateId, type Todo } from '@/utils/storage';
import AddTodoModal from './AddTodoModal';
import MandatoryChecklist from './MandatoryChecklist';
import NotificationSystem from './NotificationSystem';
import { toast } from '@/hooks/use-toast';

interface TodoAppProps {
  userName: string;
  onLogout: () => void;
  onShowHistory: () => void;
}

const TodoApp: React.FC<TodoAppProps> = ({ userName, onLogout, onShowHistory }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const savedTodos = getTodaysTodos();
    setTodos(savedTodos);
    setCompletedCount(savedTodos.filter(todo => todo.completed).length);
  }, []);

  useEffect(() => {
    saveTodaysTodos(todos);
    setCompletedCount(todos.filter(todo => todo.completed).length);
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodos(prev => [...prev, newTodo]);
    toast({
      title: "✅ Kegiatan Ditambahkan!",
      description: "Semangat menyelesaikannya!",
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        const updated = {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date().toISOString() : undefined
        };
        
        if (!todo.completed) {
          toast({
            title: "🎉 Nice! Kegiatan Selesai!",
            description: "Keren banget! Keep it up! 💪",
          });
        }
        
        return updated;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "🗑️ Kegiatan Dihapus",
      description: "Kegiatan telah dihapus dari list",
    });
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

  const customTodos = todos.filter(todo => 
    !todo.text.toLowerCase().includes('tidur') &&
    !todo.text.toLowerCase().includes('makan') &&
    !todo.text.toLowerCase().includes('minum') &&
    !todo.text.toLowerCase().includes('gerak') &&
    !todo.text.toLowerCase().includes('stres') &&
    !todo.text.toLowerCase().includes('kimia') &&
    !todo.text.toLowerCase().includes('obat')
  );

  return (
    <div className="min-h-screen modern-gradient p-4">
      <NotificationSystem userName={userName} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center space-x-2">
              <Target className="w-8 h-8 text-white subtle-bounce" />
              <span>Hi, {userName}! 👋</span>
            </h1>
            <p className="text-white/80 mt-2">{formatDate()}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onShowHistory}
              variant="outline"
              className="glass-modern border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3 transition-all duration-300"
            >
              <History className="w-5 h-5 mr-2" />
              History
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="glass-modern border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3 transition-all duration-300"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="glass-modern border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center space-x-2">
              <Target className="w-7 h-7 text-white" />
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
              <span className="text-3xl font-bold text-white">
                {getProgressPercentage()}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Mandatory Checklist */}
        <MandatoryChecklist todos={todos} onToggleTodo={toggleTodo} />

        {/* Add Todo Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white/90 text-gray-800 hover:bg-white border-0 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Tambah Kegiatan Custom ✨
          </Button>
        </div>

        {/* Custom Todo List */}
        {customTodos.length > 0 && (
          <Card className="glass-modern border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Kegiatan Custom 📝
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    todo.completed ? 'bg-green-100/80' : 'bg-white/80'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={todo.id}
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="w-6 h-6 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    
                    <div className="flex-1">
                      <label
                        htmlFor={todo.id}
                        className={`text-lg font-medium cursor-pointer transition-all duration-200 ${
                          todo.completed
                            ? 'text-green-700 line-through opacity-75'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.text}
                      </label>
                      {todo.completed && (
                        <div className="flex items-center space-x-2 mt-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            Done! Great job! 🎉
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => deleteTodo(todo.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
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
          <Card className="glass-modern border-0 shadow-xl text-center py-16">
            <CardContent>
              <Calendar className="w-20 h-20 text-white/60 mx-auto mb-6 float-animation" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Belum Ada Kegiatan Custom
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Fokus dulu sama checklist wajib, atau tambah kegiatan custom! 🌟
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white/90 text-gray-800 hover:bg-white border-0 rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105"
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
        onAdd={addTodo}
      />
    </div>
  );
};

export default TodoApp;
