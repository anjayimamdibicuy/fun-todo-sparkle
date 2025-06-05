
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckCircle, History, LogOut, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import { getCurrentUser, getTodaysTodos, saveTodaysTodos, generateId, type Todo } from '@/utils/storage';
import AddTodoModal from './AddTodoModal';
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
      title: "🎉 Kegiatan Ditambahkan!",
      description: "Semangat menyelesaikan kegiatanmu!",
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
            title: "🌟 Keren! Kegiatan Selesai!",
            description: "Kamu luar biasa! Terus semangat! 💪",
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
      description: "Kegiatan telah dihapus dari daftar",
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
    if (percentage === 100) return "🎉 Perfect! Kamu luar biasa hari ini!";
    if (percentage >= 75) return "🌟 Hampir selesai! Kamu hebat!";
    if (percentage >= 50) return "💪 Setengah jalan! Terus semangat!";
    if (percentage >= 25) return "🚀 Mulai bagus! Ayo lanjutkan!";
    return "✨ Hari yang fresh! Ayo mulai kegiatan pertama!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-500 sparkle" />
              <span>Halo, {userName}! ✨</span>
            </h1>
            <p className="text-gray-600 mt-2">{formatDate()}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onShowHistory}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              <History className="w-5 h-5 mr-2" />
              Rekap
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm border-2 border-pink-200 hover:border-pink-300 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="glass-effect border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Target className="w-7 h-7 text-blue-500 pulse-soft" />
              <span>Progress Hari Ini</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {getMotivationMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">
                {completedCount} dari {todos.length} kegiatan selesai
              </span>
              <span className="text-3xl font-bold gradient-text">
                {getProgressPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Add Todo Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 border-0 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Tambah Kegiatan Baru ✨
          </Button>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <Card className="glass-effect border-0 shadow-xl text-center py-16">
              <CardContent>
                <Calendar className="w-20 h-20 text-purple-400 mx-auto mb-6 bounce-gentle" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  Belum Ada Kegiatan Hari Ini
                </h3>
                <p className="text-gray-500 text-lg mb-6">
                  Ayo tambah kegiatan pertamamu dan mulai hari yang produktif! 🌟
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 border-0 rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Kegiatan
                </Button>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo, index) => (
              <Card
                key={todo.id}
                className={`glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  todo.completed ? 'bg-green-50/50' : 'bg-white/50'
                }`}
              >
                <CardContent className="p-6">
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
                            Selesai! Great job! 🎉
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
