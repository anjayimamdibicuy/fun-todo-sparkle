
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserPlus, Heart } from 'lucide-react';
import { useDatabase, type DatabaseUser } from '@/hooks/useDatabase';
import { toast } from '@/hooks/use-toast';

interface AuthPageProps {
  onLogin: (user: DatabaseUser) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { loginUser, registerUser, isLoading } = useDatabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const result = isLoginMode 
      ? await loginUser(name.trim())
      : await registerUser(name.trim());

    if (result.success && result.user) {
      onLogin(result.user);
      toast({
        title: isLoginMode ? "🎉 Login Berhasil!" : "✨ Akun Berhasil Dibuat!",
        description: `Selamat datang, ${result.user.name}! 💕`,
      });
    } else {
      if (isLoginMode) {
        toast({
          title: "❌ Login Gagal",
          description: "User tidak ditemukan. Coba daftar dulu ya! 😊",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ Registrasi Gagal", 
          description: "Nama sudah dipakai. Coba nama lain ya! 💫",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center modern-gradient p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <Heart className="w-4 h-4 text-pink-300/40" />
          </div>
        ))}
      </div>
      
      <Card className="w-full max-w-md glass-modern border-0 shadow-2xl relative z-10 animate-fade-in">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm animate-float">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white animate-gradient-text">
            Daily Tracker ✨
          </CardTitle>
          <CardDescription className="text-lg text-white/80">
            {isLoginMode ? 'Login untuk melanjutkan tracking! 🌟' : 'Daftar untuk mulai tracking! 💫'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white/90">
                Nama kamu apa? 👋
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ketik nama kamu di sini..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg py-3 bg-white/90 border-0 rounded-xl transition-all duration-300 hover:shadow-lg focus:shadow-lg hover:scale-105"
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
                  {isLoginMode ? <User className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLoginMode ? 'Login! 🚀' : 'Daftar! ✨'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-white/80 hover:text-white underline transition-colors duration-200"
            >
              {isLoginMode ? 'Belum punya akun? Daftar di sini! 💕' : 'Sudah punya akun? Login di sini! 🌟'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
