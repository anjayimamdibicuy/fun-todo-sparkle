
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  todoText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  todoText 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-modern border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
          {todoText && (
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-400">
              <p className="text-sm font-medium text-gray-800">"{todoText}"</p>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 border-0 rounded-xl transition-all duration-300 transform hover:scale-105 text-white"
          >
            <div className="flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
