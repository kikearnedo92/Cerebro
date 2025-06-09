
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/auth/AuthForm'
import ChatInterface from '@/components/chat/ChatInterface'
import UserMenu from '@/components/chat/UserMenu'
import { Brain } from 'lucide-react'

const queryClient = new QueryClient()

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-purple-light">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-purple">
              <Brain className="w-8 h-8 text-white brain-glow" />
            </div>
          </div>
          <h1 className="text-2xl font-bold cerebro-brand mb-2">CEREBRO</h1>
          <p className="text-primary-600 font-medium">by Retorna</p>
          <p className="text-gray-600 mt-2">Cargando plataforma de conocimiento...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Cerebro branding */}
      <header className="border-b px-4 py-3 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white brain-glow" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl cerebro-brand">CEREBRO</span>
            <span className="text-xs text-gray-500 font-medium">by Retorna</span>
          </div>
        </div>
        <UserMenu />
      </header>

      {/* Main chat interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
