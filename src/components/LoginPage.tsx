
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center modern-gradient p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute float-animation"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <CheckCircle className="w-6 h-6 text-white/20" />
          </div>
        ))}
      </div>
      
      <Card className="w-full max-w-md glass-modern border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Daily Tracker 📋
          </CardTitle>
          <CardDescription className="text-lg text-white/80">
            Masukkan nama kamu untuk mulai tracking harian! 🎯
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white/90">
                Nama kamu siapa? 👋
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ketik nama kamu di sini..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg py-3 bg-white/90 border-0 rounded-xl transition-all duration-300 hover:shadow-lg focus:shadow-lg"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full py-3 text-lg font-semibold bg-white/90 text-gray-800 hover:bg-white border-0 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Let's Go! 🚀</span>
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
