
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Droplet, Heart, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatabaseTodo } from '@/types/database';

interface EnhancedMandatoryChecklistProps {
  todos: DatabaseTodo[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onImageUpload: (todoId: string) => void;
}

const EnhancedMandatoryChecklist: React.FC<EnhancedMandatoryChecklistProps> = ({ 
  todos, 
  onToggleTodo,
  onImageUpload
}) => {
  const mandatoryItems = [
    {
      key: 'tidur',
      text: 'Tidur cukup',
      detail: '⏰ Minimal 6–8 jam, tidur sebelum jam 23.00',
      icon: <Clock className="w-5 h-5" />
    },
    {
      key: 'makan',
      text: 'Makan anti-inflamasi',
      detail: '🥦 Perbanyak sayur, buah, ikan\n🚫 Kurangi gorengan, gula, snack kemasan, susu sapi',
      icon: <Heart className="w-5 h-5" />
    },
    {
      key: 'minum',
      text: 'Minum air putih cukup',
      detail: '💧 Target 2 liter/hari',
      icon: <Droplet className="w-5 h-5" />
    },
    {
      key: 'gerak',
      text: 'Gerak ringan tiap hari',
      detail: '🚶‍♀️ Jalan pagi 15–30 menit, atau peregangan ringan',
      icon: <Heart className="w-5 h-5" />
    },
    {
      key: 'stres',
      text: 'Kelola stres',
      detail: '✍️ Tulis jurnal harian\n🧘‍♀️ Latihan napas 4-4-4 detik\n🗣️ Curhat, jangan pendam terus',
      icon: <Heart className="w-5 h-5" />
    },
    {
      key: 'kimia',
      text: 'Hindari paparan bahan kimia ringan',
      detail: '🚫 Jangan terlalu sering pakai parfum, pewangi ruangan, plastik panas',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      key: 'obat',
      text: 'Jangan minum obat/booster sembarangan',
      detail: '⚠️ Hati-hati konsumsi antibiotik, penghilang nyeri, suplemen berlebihan',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const getMandatoryTodo = (itemKey: string, itemText: string) => {
    return todos.find(todo => 
      todo.is_mandatory && 
      (todo.text === itemText || 
       todo.text.toLowerCase().includes(itemKey) ||
       (itemKey === 'makan' && todo.text.toLowerCase().includes('anti-inflamasi')) ||
       (itemKey === 'gerak' && todo.text.toLowerCase().includes('gerak')) ||
       (itemKey === 'stres' && todo.text.toLowerCase().includes('stres')) ||
       (itemKey === 'kimia' && todo.text.toLowerCase().includes('kimia')) ||
       (itemKey === 'obat' && todo.text.toLowerCase().includes('obat')))
    );
  };

  const mandatoryTodos = todos.filter(todo => todo.is_mandatory);
  const completedCount = mandatoryTodos.filter(todo => todo.completed).length;

  return (
    <Card className="glass-modern border-0 shadow-xl mb-6 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
            <span>Checklist Wajib Harian 💪</span>
          </div>
          <div className="text-sm font-normal text-gray-600 bg-white/50 px-3 py-1 rounded-full">
            {completedCount}/{mandatoryTodos.length} ✨
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mandatoryItems.map((item, index) => {
          const relatedTodo = getMandatoryTodo(item.key, item.text);
          const isCompleted = relatedTodo?.completed || false;
          
          return (
            <div
              key={item.key}
              className={`p-4 rounded-xl border-2 transition-all duration-500 transform hover:scale-102 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-scale-in' 
                  : 'bg-white/50 border-gray-200 hover:border-pink-300 hover:bg-pink-50/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`mandatory-${item.key}`}
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    if (relatedTodo) {
                      onToggleTodo(relatedTodo.id, !!checked);
                    }
                  }}
                  className="mt-1 w-6 h-6 rounded-full data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-500 data-[state=checked]:border-pink-500 transition-all duration-300"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`transition-colors duration-300 ${isCompleted ? 'text-green-600' : 'text-pink-600'}`}>
                      {item.icon}
                    </span>
                    <h3 className={`font-semibold transition-all duration-300 ${
                      isCompleted 
                        ? 'text-green-700 line-through' 
                        : 'text-gray-800'
                    }`}>
                      {index + 1}. {item.text}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line ml-7">
                    {item.detail}
                  </div>
                  
                  {relatedTodo?.image_url && (
                    <div className="mt-2 ml-7">
                      <img 
                        src={relatedTodo.image_url} 
                        alt="Bukti aktivitas" 
                        className="w-20 h-20 object-cover rounded-lg border-2 border-green-200 cursor-pointer"
                        onClick={() => relatedTodo && onImageUpload(relatedTodo.id)}
                      />
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="mt-2 ml-7 flex items-center space-x-2">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full animate-fade-in">
                        ✅ Keren! Keep it up! 🌟
                      </span>
                      <Button
                        onClick={() => relatedTodo && onImageUpload(relatedTodo.id)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-2"
                      >
                        <Camera className="w-4 h-4" />
                        {relatedTodo?.image_url ? 'Edit Foto' : 'Tambah Foto'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EnhancedMandatoryChecklist;
