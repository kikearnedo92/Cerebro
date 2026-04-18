import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { useAuth } from './hooks/useAuth'

// Public pages
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'
import AuthPage from './pages/AuthPage'

// Protected layout & pages
import AppLayout from './components/layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ChatPage from './pages/ChatPage'
import KnowledgePage from './pages/KnowledgePage'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import ProfilePage from './pages/ProfilePage'
import NotFound from './pages/NotFound'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Cargando Cerebro...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected app routes */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<ChatPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Super Admin */}
          <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
