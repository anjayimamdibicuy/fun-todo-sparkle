
import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import TodoApp from '@/components/TodoApp';
import HistoryPage from '@/components/HistoryPage';
import { getCurrentUser } from '@/utils/storage';

type Page = 'login' | 'todo' | 'history';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUserName(savedUser);
      setCurrentPage('todo');
    }
  }, []);

  const handleLogin = (name: string) => {
    setUserName(name);
    setCurrentPage('todo');
  };

  const handleLogout = () => {
    localStorage.removeItem('todo_current_user');
    setUserName('');
    setCurrentPage('login');
  };

  const handleShowHistory = () => {
    setCurrentPage('history');
  };

  const handleBackToTodo = () => {
    setCurrentPage('todo');
  };

  switch (currentPage) {
    case 'login':
      return <LoginPage onLogin={handleLogin} />;
    case 'todo':
      return (
        <TodoApp
          userName={userName}
          onLogout={handleLogout}
          onShowHistory={handleShowHistory}
        />
      );
    case 'history':
      return <HistoryPage onBack={handleBackToTodo} />;
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
};

export default Index;
