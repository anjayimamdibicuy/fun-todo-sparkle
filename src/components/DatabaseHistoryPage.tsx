
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CheckCircle, Clock, Sparkles, Heart } from 'lucide-react';
import { useDatabase, type DatabaseTodo } from '@/hooks/useDatabase';

interface DatabaseHistoryPageProps {
  onBack: () => void;
}

const DatabaseHistoryPage: React.FC<DatabaseHistoryPageProps> = ({ onBack }) => {
  const [history, setHistory] = useState<{ date: string; todos: DatabaseTodo[] }[]>([]);
  const { getHistory } = useDatabase();

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await getHistory();
      setHistory(historyData);
    };
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionStats = (todos: DatabaseTodo[]) => {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Heart className="w-6 h-6 text-pink-300/30" />
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-purple-500 animate-bounce" />
              <span>✨ Rekap Kegiatan ✨</span>
            </h1>
            <p className="text-gray-600 mt-2">Lihat semua pencapaian luar biasamu! 🌟</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        {history.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl text-center py-12 animate-scale-in">
            <CardContent>
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Belum Ada Riwayat
              </h3>
              <p className="text-gray-500">
                Mulai menyelesaikan kegiatan untuk melihat riwayatmu di sini! 💪
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {history.map((day, index) => {
              const stats = getCompletionStats(day.todos);
              return (
                <Card
                  key={day.date}
                  className="bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                          <Clock className="w-6 h-6 text-blue-500 animate-pulse" />
                          <span>{formatDate(day.date)}</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          {stats.completed} dari {stats.total} kegiatan selesai
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                          {stats.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">Progress</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 h-3 rounded-full transition-all duration-1000 animate-pulse"
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {day.todos.map((todo, todoIndex) => (
                        <div
                          key={todo.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                            todo.completed
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400'
                              : 'bg-gray-50 border-l-4 border-gray-300'
                          }`}
                        >
                          <CheckCircle
                            className={`w-6 h-6 transition-all duration-300 ${
                              todo.completed ? 'text-green-500 animate-bounce' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`flex-1 transition-all duration-300 ${
                              todo.completed
                                ? 'text-green-800 line-through'
                                : 'text-gray-700'
                            }`}
                          >
                            {todo.text}
                          </span>
                          {todo.is_mandatory && (
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              💪 Wajib
                            </span>
                          )}
                          {todo.completed && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
                              ✅ Selesai
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseHistoryPage;
