
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EnhancedImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted: () => void;
  todoId: string;
  currentImageUrl?: string;
}

const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  onImageDeleted,
  todoId,
  currentImageUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive"
      });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${todoId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('todo-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('todo-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('todos')
        .update({ image_url: imageUrl })
        .eq('id', todoId);

      if (updateError) throw updateError;

      onImageUploaded(imageUrl);
      onClose();
      
      toast({
        title: "✅ Berhasil!",
        description: "Bukti foto berhasil diupload! 📸",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Gagal upload gambar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl) return;
    
    try {
      setUploading(true);
      
      // Extract filename from URL
      const urlParts = currentImageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('todo-images')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Update todo
      const { error: updateError } = await supabase
        .from('todos')
        .update({ image_url: null })
        .eq('id', todoId);

      if (updateError) throw updateError;

      onImageDeleted();
      onClose();
      
      toast({
        title: "🗑️ Berhasil!",
        description: "Gambar berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus gambar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Kelola Bukti Foto 📸</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {currentImageUrl && (
              <div className="relative">
                <img 
                  src={currentImageUrl} 
                  alt="Current image" 
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => setShowImagePreview(true)}
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    onClick={() => setShowImagePreview(true)}
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleDeleteImage}
                    variant="ghost"
                    size="sm"
                    className="bg-red-500/80 text-white hover:bg-red-600"
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  onClick={() => setPreviewUrl(null)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer"
              />
              
              <div className="flex space-x-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                >
                  Batal
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="text-center text-sm text-gray-500">
                <Upload className="w-4 h-4 animate-spin mx-auto mb-2" />
                {currentImageUrl ? 'Menghapus...' : 'Uploading...'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {showImagePreview && currentImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="max-w-4xl max-h-full">
            <img 
              src={currentImageUrl} 
              alt="Preview gambar" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedImageUpload;
