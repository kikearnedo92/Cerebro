
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'
import { Brain } from 'lucide-react'

const LandingPage = () => {
  const { user, loading } = useAuth()

  console.log('🏠 LandingPage - user:', user?.email, 'loading:', loading)

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
    console.log('➡️ User authenticated, redirecting to chat')
    return <Navigate to="/chat" replace />
  }

  console.log('📄 Showing landing page')
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">CEREBRO</h1>
              <p className="text-sm text-purple-600">by Retorna</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900">
                Tu asistente de
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text"> conocimiento</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Cerebro es la plataforma de conocimiento interno de Retorna. 
                Accede a toda la información que necesitas para tu trabajo diario.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">IA Inteligente</h3>
                <p className="text-gray-600 text-sm">
                  Respuestas instantáneas basadas en nuestro conocimiento interno
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Base de Conocimiento</h3>
                <p className="text-gray-600 text-sm">
                  Documentos, políticas y procedimientos centralizados
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <AuthForm />
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
