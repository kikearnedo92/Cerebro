
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mic, Rocket, Target, Brain, Lightbulb, Users } from 'lucide-react'

const LaunchPage = () => {
  return (
    <ProtectedRoute 
      featureFlag="launch_voice"
      fallbackTitle="Launch - Próximamente"
      fallbackMessage="El módulo Launch estará disponible pronto en Núcleo. Incluirá onboarding por voz y generación de estrategias con IA."
    >
      <div className="h-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="w-6 h-6 text-orange-500" />
              Launch - Estrategia con IA
            </h1>
            <p className="text-gray-600">
              Onboarding por voz y generación automática de estrategias de negocio
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Núcleo Exclusivo
          </Badge>
        </div>

        {/* Voice Onboarding Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" />
              Onboarding por Voz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Configuración de Voz</h3>
                <p className="text-sm text-gray-600">
                  Sistema de onboarding conversacional que permite a los usuarios 
                  describir su negocio de forma natural usando su voz.
                </p>
                <Button disabled className="w-full">
                  <Mic className="w-4 h-4 mr-2" />
                  Iniciar Conversación de Voz
                </Button>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Procesamiento IA</h3>
                <p className="text-sm text-gray-600">
                  Conversión automática de audio a texto y análisis inteligente 
                  para extraer información clave del negocio.
                </p>
                <div className="text-xs text-gray-500">
                  • Transcripción con Whisper AI<br/>
                  • Análisis de contexto empresarial<br/>
                  • Extracción de objetivos y metas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Generación de Estrategia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Brain className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-medium mb-2">Análisis de Mercado</h4>
                <p className="text-sm text-gray-600">
                  IA analiza tendencias del mercado y competencia relevante
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Lightbulb className="w-8 h-8 text-yellow-500 mb-2" />
                <h4 className="font-medium mb-2">Estrategias Personalizadas</h4>
                <p className="text-sm text-gray-600">
                  Generación de estrategias específicas basadas en el contexto
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <h4 className="font-medium mb-2">Plan de Acción</h4>
                <p className="text-sm text-gray-600">
                  Roadmap detallado con pasos concretos para implementar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-gray-600">Próximamente en Launch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                • Integración con Meta Business API<br/>
                • Generación automática de campañas publicitarias<br/>
                • Análisis de audiencias objetivo
              </div>
              <div>
                • Conectores con Google Ads<br/>
                • Automatización de estrategias de marketing<br/>
                • Dashboard de métricas en tiempo real
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

export default LaunchPage
