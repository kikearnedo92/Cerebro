
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import ChatPage from '@/pages/ChatPage'
import KnowledgePage from '@/pages/KnowledgePage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFound from '@/pages/NotFound'

// Admin Pages
import AnalyticsPage from '@/pages/admin/AnalyticsPage'
import UsersPage from '@/pages/admin/UsersPage'
import KnowledgeBasePage from '@/pages/admin/KnowledgeBasePage'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return <Navigate to="/chat" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/chat/:conversationId" element={<ChatPage />} />
                      <Route path="/knowledge" element={<KnowledgePage />} />
                      <Route path="/integrations" element={<IntegrationsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      
                      {/* Admin Routes */}
                      <Route 
                        path="/admin/analytics" 
                        element={
                          <AdminRoute>
                            <AnalyticsPage />
                          </AdminRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <AdminRoute>
                            <UsersPage />
                          </AdminRoute>
                        } 
                      />
                      <Route 
                        path="/admin/knowledge" 
                        element={
                          <AdminRoute>
                            <KnowledgeBasePage />
                          </AdminRoute>
                        } 
                      />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MainLayout>
                </SidebarProvider>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
