
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/auth/AuthForm'
import MainLayout from '@/components/layout/MainLayout'
import ChatInterface from '@/components/chat/ChatInterface'
import KnowledgeBasePage from '@/pages/admin/KnowledgeBasePage'
import UsersPage from '@/pages/admin/UsersPage'
import AnalyticsPage from '@/pages/admin/AnalyticsPage'
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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">CEREBRO</h1>
      <p className="text-purple-600 font-medium">by Retorna</p>
      <p className="text-gray-600 mt-2">Cargando plataforma de conocimiento...</p>
    </div>
  </div>
)

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Force admin for eduardo@retorna.app
  const isAdmin = profile?.role_system === 'admin' || user?.email === 'eduardo@retorna.app'

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/chat" replace />
  }

  return <>{children}</>
}

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatInterface />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/knowledge" element={
          <ProtectedRoute requireAdmin>
            <KnowledgeBasePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </MainLayout>
  )
}

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

export default App
