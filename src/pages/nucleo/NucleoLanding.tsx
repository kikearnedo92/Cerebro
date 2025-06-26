
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'
import { Brain, Rocket, Code, Bot, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NucleoLanding = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading Núcleo...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Commercial AI Platform</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => window.open('/cerebro', '_blank')}
          >
            Ver Cerebro →
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
                The complete
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text block lg:inline"> AI business suite</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                From voice strategy to automated campaigns. Núcleo transforms 
                how businesses create, develop, and scale with AI.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Launch</h3>
                <p className="text-gray-600 text-sm">
                  Voice onboarding and AI strategy generation
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AutoDev</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered development and code generation
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Automation</h3>
                <p className="text-gray-600 text-sm">
                  n8n workflows for campaign automation
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Insights</h3>
                <p className="text-gray-600 text-sm">
                  Advanced analytics and business intelligence
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">Voice → Strategy → Campaign Pipeline</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete automation from voice input to live advertising campaigns on Meta and Google Ads.
              </p>
              <div className="text-xs text-gray-500">
                • Whisper AI transcription • GPT-4 strategy generation • Automated campaign creation
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

export default NucleoLanding
