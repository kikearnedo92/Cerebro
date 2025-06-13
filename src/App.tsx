
import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import LandingPage from "./pages/LandingPage"
import Index from "./pages/Index"
import ChatPage from "./pages/ChatPage"
import KnowledgePage from "./pages/KnowledgePage"
import UsersPage from "./pages/UsersPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import IntegrationsPage from "./pages/IntegrationsPage"
import TenantsPage from "./pages/admin/TenantsPage"
import MainLayout from "./components/layout/MainLayout"
import './index.css'

// Create QueryClient outside component to avoid recreating on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  console.log('🔒 ProtectedRoute - user:', user?.email, 'loading:', loading)
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando Cerebro...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    console.log('🚫 No user, redirecting to landing')
    return <Navigate to="/landing" replace />
  }
  
  console.log('✅ User authenticated, showing protected content')
  return <MainLayout>{children}</MainLayout>
}

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSuperAdmin, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Verificando permisos...</p>
        </div>
      </div>
    )
  }
  
  if (!isSuperAdmin) {
    return <Navigate to="/chat" replace />
  }
  
  return <MainLayout>{children}</MainLayout>
}

const App = () => {
  console.log('🚀 App component rendered')
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route 
              path="/dashboard" 
              element={<Navigate to="/chat" replace />} 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
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
              path="/integrations" 
              element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/tenants" 
              element={
                <SuperAdminRoute>
                  <TenantsPage />
                </SuperAdminRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
