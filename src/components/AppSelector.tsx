
import React from 'react'
import { Brain, Zap, ArrowRight, MessageSquare, TrendingUp, Code, Bot, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AppSelector = () => {
  const navigateTo = (app: 'cerebro' | 'nucleo') => {
    window.location.href = `/${app}/landing`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            Núcleo AI Platform
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your AI experience: Internal knowledge management or complete commercial suite
          </p>
        </div>

        {/* App Cards */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Cerebro Card */}
          <Card 
            className="group hover:shadow-2xl transition-all duration-300 border-purple-200 hover:border-purple-300 cursor-pointer bg-gradient-to-br from-purple-50 to-white"
            onClick={() => navigateTo('cerebro')}
          >
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl lg:text-3xl text-purple-900">CEREBRO</CardTitle>
              <p className="text-purple-600">Internal Knowledge Platform</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-center">
                Plataforma interna de conocimiento empresarial con IA para equipos y organizaciones.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <span>Chat AI con base de conocimiento</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>Analytics e insights empresariales</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span>Gestión de documentos y usuarios</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 group-hover:scale-105 transition-all text-base py-3"
                size="lg"
              >
                Acceder a Cerebro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Núcleo Card */}
          <Card 
            className="group hover:shadow-2xl transition-all duration-300 border-blue-200 hover:border-blue-300 cursor-pointer bg-gradient-to-br from-blue-50 via-white to-green-50"
            onClick={() => navigateTo('nucleo')}
          >
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl lg:text-3xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-bold">
                NÚCLEO
              </CardTitle>
              <p className="text-blue-600 font-medium">Commercial AI Suite</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-center">
                Suite comercial completa de IA para crear, desarrollar y automatizar negocios.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Rocket className="w-5 h-5 text-orange-500" />
                  <span>Launch: Voice strategy generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Code className="w-5 h-5 text-blue-500" />
                  <span>AutoDev: AI development platform</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <span>Automation: Workflow engine</span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 group-hover:scale-105 transition-all text-base py-3"
                size="lg"
              >
                Acceder a Núcleo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-gray-500 text-sm">
            Powered by Núcleo AI • Choose the right platform for your needs
          </p>
        </div>
      </div>
    </div>
  )
}

export default AppSelector
