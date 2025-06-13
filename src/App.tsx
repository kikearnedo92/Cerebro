
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuthProvider } from '@/hooks/useAuth'

// Pages
import Index from '@/pages/Index'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import ChatPage from '@/pages/ChatPage'
import KnowledgePage from '@/pages/KnowledgePage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ProfilePage from '@/pages/ProfilePage'
import UsersPage from '@/pages/UsersPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import NotFound from '@/pages/NotFound'

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

function AppContent() {
  const auth = useAuthProvider()

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider value={auth}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/chat" element={<MainLayout><ChatPage /></MainLayout>} />
          <Route path="/chat/:conversationId" element={<MainLayout><ChatPage /></MainLayout>} />
          <Route path="/knowledge" element={<MainLayout><KnowledgePage /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/users" element={<MainLayout><UsersPage /></MainLayout>} />
          <Route path="/integrations" element={<MainLayout><IntegrationsPage /></MainLayout>} />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
