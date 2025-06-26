
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'
import { Zap, Rocket, Code, Bot, TrendingUp, MessageSquare, Shield, Sparkles } from 'lucide-react'
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Commercial AI Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Next-Gen AI Suite
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                The complete
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text block lg:inline"> AI business platform</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                From voice strategy to automated campaigns. Núcleo transforms 
                how businesses create, develop, and scale with AI technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Launch</h3>
                <p className="text-gray-600 text-sm">
                  Voice onboarding and AI strategy generation
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">AutoDev</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered development and code generation
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Automation</h3>
                <p className="text-gray-600 text-sm">
                  Workflow automation and campaign management
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Insights</h3>
                <p className="text-gray-600 text-sm">
                  Advanced analytics and business intelligence
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Voice → Strategy → Campaign Pipeline</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete automation from voice input to live advertising campaigns on Meta and Google Ads.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="bg-white px-2 py-1 rounded-md border">• Whisper AI transcription</span>
                <span className="bg-white px-2 py-1 rounded-md border">• GPT-4 strategy generation</span>
                <span className="bg-white px-2 py-1 rounded-md border">• Automated campaign creation</span>
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
