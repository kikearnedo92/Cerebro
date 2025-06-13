
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/auth/AuthForm'
import MainLayout from '@/components/layout/MainLayout'
import ChatInterface from '@/components/chat/ChatInterface'
import ConversationalChatInterface from '@/components/chat/ConversationalChatInterface'
import Analytics from '@/components/Analytics'
import KnowledgeBasePage from '@/pages/admin/KnowledgeBasePage'
import UsersPage from '@/pages/UsersPage'
import AdminUsersPage from '@/pages/admin/UsersPage'
import TenantsPage from '@/pages/admin/TenantsPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import ProfilePage from '@/pages/ProfilePage'
import { SidebarProvider } from '@/components/ui/sidebar'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/auth" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/chat/:conversationId" element={<ConversationalChatInterface />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/tenants" element={<TenantsPage />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </MainLayout>
      </div>
    </SidebarProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
