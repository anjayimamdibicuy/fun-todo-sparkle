
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imageUrl: string) => void;
  todoId: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  todoId
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
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
      
      // Update todo with image URL
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Upload Bukti Foto 📸</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
              Uploading...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
