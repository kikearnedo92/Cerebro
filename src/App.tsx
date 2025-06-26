
import React, { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MainLayout from './components/layout/MainLayout'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import InsightsPage from './pages/InsightsPage'
import KnowledgePage from './pages/KnowledgePage'
import UsersPage from './pages/UsersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import ProfilePage from './pages/ProfilePage'
import TenantsPage from './pages/admin/TenantsPage'
import FeatureFlagsPage from './pages/FeatureFlagsPage'
import KnowledgeBasePage from './pages/admin/KnowledgeBasePage'
import NotFound from './pages/NotFound'

import LaunchPage from './pages/LaunchPage'
import BuildPage from './pages/BuildPage'
import AutomationPage from './pages/AutomationPage'

function AppRouter() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (session && location.pathname === '/landing') {
        navigate('/chat')
      } else if (!session && location.pathname !== '/landing') {
        navigate('/landing')
      }
    }
  }, [session, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Private routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/launch" element={<LaunchPage />} />
        <Route path="/autodev" element={<BuildPage />} />
        <Route path="/automation" element={<AutomationPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/tenants" element={<TenantsPage />} />
        <Route path="/feature-flags" element={<FeatureFlagsPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  )
}

export default App
