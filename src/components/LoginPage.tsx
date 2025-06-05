
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles, Star } from 'lucide-react';
import { setCurrentUser } from '@/utils/storage';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentUser(name.trim());
        onLogin(name.trim());
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-4 h-4 text-pink-400 opacity-50" />
          </div>
        ))}
      </div>
      
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center space-x-2">
            <Heart className="w-8 h-8 text-pink-500 sparkle" />
            <Sparkles className="w-8 h-8 text-purple-500 bounce-gentle" />
            <Heart className="w-8 h-8 text-pink-500 sparkle" />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">
            ✨ Daily Magic ✨
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Masukkan nama cantikmu untuk memulai petualangan harian! 💕
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Siapa nama cantiknya? 🌸
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Tulis nama indahmu di sini..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg py-3 border-2 border-pink-200 focus:border-purple-400 rounded-xl transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 border-0 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mempersiapkan keajaiban...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Mulai Petualangan! 🚀</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
