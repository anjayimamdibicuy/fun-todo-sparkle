
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TodoComment } from '@/types/database';

interface CommentSectionProps {
  todoId: string;
  currentUserName: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ todoId, currentUserName }) => {
  const [comments, setComments] = useState<TodoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, todoId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_comments')
        .select('*')
        .eq('todo_id', todoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('todo_comments')
        .insert([{
          todo_id: todoId,
          user_name: currentUserName,
          comment: newComment.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setNewComment('');
      
      toast({
        title: "💬 Komentar terkirim!",
        description: "Komentar berhasil ditambahkan",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan komentar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-2">
      <Button
        onClick={() => setShowComments(!showComments)}
        variant="ghost"
        size="sm"
        className="text-blue-500 hover:text-blue-700"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        {comments.length > 0 ? `${comments.length} Komentar` : 'Tambah Komentar'}
      </Button>

      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-gray-50">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <User className="w-4 h-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">
                            {comment.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
