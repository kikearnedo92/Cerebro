
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Index from './pages/Index'
import ChatPage from './pages/ChatPage'
import UsersPage from './pages/UsersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import KnowledgePage from './pages/KnowledgePage'
import ProfilePage from './pages/ProfilePage'
import IntegrationsPage from './pages/IntegrationsPage'
import InsightsPage from './pages/InsightsPage'
import AutoDevPage from './pages/AutoDevPage'
import FeatureFlagsPage from './pages/FeatureFlagsPage'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import MainLayout from './components/layout/MainLayout'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/landing" replace />
  }
  
  return <MainLayout>{children}</MainLayout>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route
              path="/chat/*"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/autodev"
              element={
                <ProtectedRoute>
                  <AutoDevPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute>
                  <KnowledgePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feature-flags"
              element={
                <ProtectedRoute>
                  <FeatureFlagsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
