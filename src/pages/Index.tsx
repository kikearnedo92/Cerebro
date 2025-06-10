
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  console.log('📍 Index page - user:', user?.email, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando Cerebro...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario autenticado, redirigir a chat
  if (user) {
    console.log('➡️ Redirecting authenticated user to /chat');
    return <Navigate to="/chat" replace />;
  }

  // Si no hay usuario, redirigir a landing page
  console.log('➡️ Redirecting to landing page');
  return <Navigate to="/" replace />;
};

export default Index;
