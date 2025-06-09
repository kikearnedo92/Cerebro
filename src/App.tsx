
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/auth/AuthForm'
import MainLayout from '@/components/layout/MainLayout'
import ChatInterface from '@/components/chat/ChatInterface'
import KnowledgeBaseManager from '@/components/admin/KnowledgeBaseManager'
import UserManagement from '@/components/admin/UserManagement'
import Analytics from '@/components/admin/Analytics'
import { Brain } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center gradient-purple-light">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-purple">
          <Brain className="w-8 h-8 text-white brain-glow" />
        </div>
      </div>
      <h1 className="text-2xl font-bold cerebro-brand mb-2">CEREBRO</h1>
      <p className="text-primary-600 font-medium">by Retorna</p>
      <p className="text-gray-600 mt-2">Cargando plataforma de conocimiento...</p>
    </div>
  </div>
)

const AppContent = () => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <AuthForm />
  }

  const isAdmin = profile?.role_system === 'admin'

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/chat" element={<ChatInterface />} />
        
        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route path="/admin/knowledge" element={<KnowledgeBaseManager />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
          </>
        )}
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
