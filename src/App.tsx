
import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import LandingPage from "./pages/LandingPage"
import ChatPage from "./pages/ChatPage"
import KnowledgePage from "./pages/KnowledgePage"
import UsersPage from "./pages/UsersPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import MainLayout from "./components/layout/MainLayout"
import './index.css'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
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
    return <Navigate to="/" replace />
  }
  
  return <MainLayout>{children}</MainLayout>
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
