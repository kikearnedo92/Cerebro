
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import CerebroLayout from '@/components/layouts/CerebroLayout'
import CerebroLanding from '@/pages/cerebro/CerebroLanding'
import PersonalitySettingsPage from '@/pages/cerebro/PersonalitySettingsPage'
import ChatPage from '@/pages/ChatPage'
import InsightsPage from '@/pages/InsightsPage'
import KnowledgePage from '@/pages/KnowledgePage'
import UsersPage from '@/pages/UsersPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import IntegrationsPage from '@/pages/IntegrationsPage'
import ProfilePage from '@/pages/ProfilePage'
import TenantsPage from '@/pages/admin/TenantsPage'
import FeatureFlagsPage from '@/pages/FeatureFlagsPage'
import CalendarioPage from '@/pages/CalendarioPage'
import EquipoPage from '@/pages/EquipoPage'
import ReportesPage from '@/pages/ReportesPage'
import NotFound from '@/pages/NotFound'

function CerebroApp() {
  const { session, loading } = useAuth()

  console.log('🧠 CerebroApp - Session:', !!session, 'Loading:', loading)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando Cerebro...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<CerebroLanding />} />
      
      {/* Protected routes - check for session */}
      {session ? (
        <Route path="/" element={<CerebroLayout />}>
          <Route index element={<ChatPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings/personality" element={<PersonalitySettingsPage />} />
          <Route path="admin/tenants" element={<TenantsPage />} />
          <Route path="feature-flags" element={<FeatureFlagsPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="equipo" element={<EquipoPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      ) : (
        /* Redirect unauthenticated users to landing */
        <Route path="/*" element={<Navigate to="/cerebro/landing" replace />} />
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default CerebroApp
