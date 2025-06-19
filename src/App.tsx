import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

// Pages
import LandingPage from '@/pages/LandingPage'
import ChatPage from '@/pages/ChatPage'
import KnowledgePage from '@/pages/KnowledgePage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ProfilePage from '@/pages/ProfilePage'
import UsersPage from '@/pages/UsersPage'
import IntegrationsPage from '@/pages/IntegrationsPage'

// Layout
import MainLayout from '@/components/layout/MainLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Cerebro...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/landing" replace />
  }

  return <>{children}</>
}

// Routes Component
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />
        <Route path="/auth/*" element={<LandingPage />} />

        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
<Route path="/admin/*" element={<Navigate to="/chat" replace />} />
<Route path="/tenants/*" element={<Navigate to="/chat" replace />} />

        <Route path="/chat" element={
          <ProtectedRoute>
            <MainLayout><ChatPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/chat/:conversationId" element={
          <ProtectedRoute>
            <MainLayout><ChatPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/knowledge" element={
          <ProtectedRoute>
            <MainLayout><KnowledgePage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <MainLayout><AnalyticsPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout><UsersPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/integrations" element={
          <ProtectedRoute>
            <MainLayout><IntegrationsPage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to landing */}
        <Route path="/admin/*" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  )
}

// Main App
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App