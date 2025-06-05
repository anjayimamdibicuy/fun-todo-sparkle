
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Droplet, Heart, AlertTriangle } from 'lucide-react';
import { type Todo } from '@/utils/storage';

interface MandatoryChecklistProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
}

const MandatoryChecklist: React.FC<MandatoryChecklistProps> = ({ todos, onToggleTodo }) => {
  const mandatoryItems = [
    {
      id: 'sleep',
      text: 'Tidur cukup',
      detail: '⏰ Minimal 6–8 jam, tidur sebelum jam 23.00',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'anti-inflammatory',
      text: 'Makan anti-inflamasi',
      detail: '🥦 Perbanyak sayur, buah, ikan\n🚫 Kurangi gorengan, gula, snack kemasan, susu sapi',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'water',
      text: 'Minum air putih cukup',
      detail: '💧 Target 2 liter/hari',
      icon: <Droplet className="w-5 h-5" />
    },
    {
      id: 'exercise',
      text: 'Gerak ringan tiap hari',
      detail: '🚶‍♀️ Jalan pagi 15–30 menit, atau peregangan ringan',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'stress',
      text: 'Kelola stres',
      detail: '✍️ Tulis jurnal harian\n🧘‍♀️ Latihan napas 4-4-4 detik\n🗣️ Curhat, jangan pendam terus',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'chemicals',
      text: 'Hindari paparan bahan kimia ringan',
      detail: '🚫 Jangan terlalu sering pakai parfum, pewangi ruangan, plastik panas',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      id: 'medicine',
      text: 'Jangan minum obat/booster sembarangan',
      detail: '⚠️ Hati-hati konsumsi antibiotik, penghilang nyeri, suplemen berlebihan',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const getMandatoryTodo = (itemId: string) => {
    return todos.find(todo => todo.text.toLowerCase().includes(itemId) || todo.id === itemId);
  };

  return (
    <Card className="glass-modern border-0 shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-500 subtle-bounce" />
          <span>Checklist Wajib Harian 💪</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mandatoryItems.map((item, index) => {
          const relatedTodo = getMandatoryTodo(item.id);
          const isCompleted = relatedTodo?.completed || false;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white/50 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={item.id}
                  checked={isCompleted}
                  onCheckedChange={() => {
                    if (relatedTodo) {
                      onToggleTodo(relatedTodo.id);
                    }
                  }}
                  className="mt-1 w-5 h-5 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-600">{item.icon}</span>
                    <h3 className={`font-semibold ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                      {index + 1}. {item.text}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line ml-7">
                    {item.detail}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default MandatoryChecklist;
