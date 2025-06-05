
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Target } from 'lucide-react';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [todoText, setTodoText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      setIsAdding(true);
      setTimeout(() => {
        onAdd(todoText.trim());
        setTodoText('');
        setIsAdding(false);
        onClose();
      }, 500);
    }
  };

  const handleClose = () => {
    setTodoText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-modern border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 modern-gradient rounded-full">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold gradient-text-modern">
            Tambah Kegiatan Baru 📝
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Apa yang mau dikerjain hari ini? 🎯
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Contoh: Olahraga 30 menit 🏃‍♀️"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              className="text-center text-lg py-3 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-300"
              required
              autoFocus
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!todoText.trim() || isAdding}
              className="flex-1 py-3 modern-gradient border-0 rounded-xl transition-all duration-300 transform hover:scale-105 text-white"
            >
              {isAdding ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Tambah! ✨</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTodoModal;
