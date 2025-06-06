
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Eye, Calendar, Camera, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PublicTodo } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import CommentSection from '../Comments/CommentSection';

interface PublicTodosPageProps {
  onBack: () => void;
}

const PublicTodosPage: React.FC<PublicTodosPageProps> = ({ onBack }) => {
  const [publicTodos, setPublicTodos] = useState<PublicTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    // Get current user from localStorage
    const savedUser = localStorage.getItem('todo_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user.name);
    }
    
    loadPublicTodos();
  }, []);

  const loadPublicTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('public_todos')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setPublicTodos(data || []);
    } catch (error) {
      console.error('Error loading public todos:', error);
      toast({
        title: "Error",
        description: "Gagal memuat aktivitas publik",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyTodo = (userName: string) => userName === currentUser;

  const groupedTodos = publicTodos.reduce((acc: Record<string, PublicTodo[]>, todo) => {
    const date = todo.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(todo);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen modern-gradient p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading aktivitas publik...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            onClick={onBack}
            variant="outline"
            className="glass-modern border-white/30 text-white hover:bg-white/20 rounded-xl px-6 py-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white flex items-center space-x-2">
              <Users className="w-8 h-8 text-white animate-bounce" />
              <span>Aktivitas Publik 🌟</span>
            </h1>
            <p className="text-white/80 mt-2">Lihat apa yang sudah diselesaikan teman-teman!</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        {Object.keys(groupedTodos).length === 0 ? (
          <Card className="glass-modern border-0 shadow-xl text-center py-16">
            <CardContent>
              <Eye className="w-16 h-16 text-white/60 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Belum Ada Aktivitas
              </h3>
              <p className="text-white/80">
                Belum ada yang menyelesaikan aktivitas hari ini!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTodos)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, todos]) => (
                <Card key={date} className="glass-modern border-0 shadow-xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <span>{formatDate(date)}</span>
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {todos.length} aktivitas selesai
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {todos.map((todo) => {
                      const isMine = isMyTodo(todo.user_name);
                      return (
                        <div
                          key={todo.id}
                          className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:scale-[1.02] ${
                            isMine 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400' 
                              : 'bg-white/90 border-green-400'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`font-semibold ${isMine ? 'text-blue-800' : 'text-gray-800'}`}>
                                  {todo.user_name} {isMine && '(Kamu)'}
                                </span>
                                {todo.is_mandatory && (
                                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full flex items-center space-x-1">
                                    <Heart className="w-3 h-3" />
                                    <span>Wajib</span>
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {todo.completed_at && formatTime(todo.completed_at)}
                                </span>
                              </div>
                              
                              <p className={`font-medium mb-2 ${isMine ? 'text-blue-700' : 'text-gray-700'}`}>
                                ✅ {todo.text}
                              </p>

                              {todo.image_url && (
                                <div className="mb-2">
                                  <img 
                                    src={todo.image_url} 
                                    alt="Bukti aktivitas" 
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => setSelectedImage(todo.image_url!)}
                                  />
                                </div>
                              )}

                              {/* Comment Section */}
                              <CommentSection 
                                todoId={todo.id} 
                                currentUserName={currentUser}
                              />
                            </div>
                            
                            {todo.image_url && (
                              <Button
                                onClick={() => setSelectedImage(todo.image_url!)}
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-blue-500 hover:text-blue-700"
                              >
                                <Camera className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Bukti aktivitas" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTodosPage;
