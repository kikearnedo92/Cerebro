
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import NucleoLayout from '@/components/layouts/NucleoLayout'
import NucleoLanding from '@/pages/nucleo/NucleoLanding'
import ChatPage from '@/pages/ChatPage'
import InsightsPage from '@/pages/InsightsPage'
import LaunchPage from '@/pages/LaunchPage'
import BuildPage from '@/pages/BuildPage'
import AutomationPage from '@/pages/AutomationPage'
import KnowledgePage from '@/pages/KnowledgePage'
import UsersPage from '@/pages/UsersPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFound from '@/pages/NotFound'

function NucleoApp() {
  const { session, loading } = useAuth()

  console.log('⚡ NucleoApp - Session:', !!session, 'Loading:', loading)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Cargando NÚCLEO...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<NucleoLanding />} />
      
      {/* Protected routes - check for session */}
      {session ? (
        <Route path="/" element={<NucleoLayout />}>
          <Route index element={<Navigate to="/nucleo/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="launch" element={<LaunchPage />} />
          <Route path="autodev" element={<BuildPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      ) : (
        /* Redirect unauthenticated users to landing */
        <Route path="/*" element={<Navigate to="/nucleo/landing" replace />} />
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default NucleoApp
