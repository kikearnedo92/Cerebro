
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'
import { Brain, MessageSquare, TrendingUp, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CerebroLanding = () => {
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

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-purple-900">CEREBRO</h1>
              <p className="text-xs text-purple-600 hidden sm:block">by Retorna</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => window.open('/nucleo', '_blank')}
          >
            Ver Núcleo →
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
                Tu asistente de
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text block lg:inline"> conocimiento</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Cerebro es tu plataforma de conocimiento empresarial interna. 
                Accede a toda la información que necesitas para tu trabajo diario.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Chat Inteligente</h3>
                <p className="text-gray-600 text-sm">
                  Conversaciones con IA basadas en tu conocimiento interno
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Insights</h3>
                <p className="text-gray-600 text-sm">
                  Analytics y métricas de uso para optimizar procesos
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Base de Conocimiento</h3>
                <p className="text-gray-600 text-sm">
                  Documentos y procedimientos centralizados
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Uso Interno</h3>
                <p className="text-gray-600 text-sm">
                  Plataforma segura para equipos empresariales
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="w-full max-w-md">
              <AuthForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CerebroLanding
