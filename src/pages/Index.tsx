
import React, { useState, useEffect } from 'react';
import AuthPage from '@/components/AuthPage';
import DatabaseTodoApp from '@/components/DatabaseTodoApp';
import DatabaseHistoryPage from '@/components/DatabaseHistoryPage';
import { type DatabaseUser } from '@/hooks/useDatabase';

type Page = 'auth' | 'todo' | 'history';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [currentUser, setCurrentUser] = useState<DatabaseUser | null>(null);

  useEffect(() => {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('todo_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentPage('todo');
      } catch (error) {
        localStorage.removeItem('todo_current_user');
      }
    }
  }, []);

  const handleLogin = (user: DatabaseUser) => {
    setCurrentUser(user);
    setCurrentPage('todo');
    localStorage.setItem('todo_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('todo_current_user');
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleShowHistory = () => {
    setCurrentPage('history');
  };

  const handleBackToTodo = () => {
    setCurrentPage('todo');
  };

  switch (currentPage) {
    case 'auth':
      return <AuthPage onLogin={handleLogin} />;
    case 'todo':
      return currentUser ? (
        <DatabaseTodoApp
          user={currentUser}
          onLogout={handleLogout}
          onShowHistory={handleShowHistory}
        />
      ) : (
        <AuthPage onLogin={handleLogin} />
      );
    case 'history':
      return <DatabaseHistoryPage onBack={handleBackToTodo} />;
    default:
      return <AuthPage onLogin={handleLogin} />;
  }
};

export default Index;
