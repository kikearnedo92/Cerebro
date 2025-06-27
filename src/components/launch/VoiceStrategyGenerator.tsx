
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, MicOff, Upload, Zap, Target, TrendingUp, DollarSign, Users, Calendar, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const VoiceStrategyGenerator = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [transcription, setTranscription] = useState('')
  const [strategy, setStrategy] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form data para onboarding guiado
  const [formData, setFormData] = useState({
    businessType: '',
    targetAudience: '',
    currentRevenue: '',
    goals: '',
    budget: '',
    timeline: '',
    competitors: '',
    uniqueValue: ''
  })

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      toast({
        title: "Grabando",
        description: "Describe tu negocio, audiencia objetivo y metas..."
      })
      
      // Simular transcripción después de 5 segundos
      setTimeout(() => {
        setIsRecording(false)
        setTranscription("Tengo una startup de fintech que ayuda a freelancers a gestionar sus finanzas. Mi audiencia objetivo son freelancers de 25-40 años que facturan entre $2000-8000 al mes. Quiero lanzar una campaña para adquirir 1000 usuarios en 3 meses con un presupuesto de $15000.")
        setCurrentStep(2)
        toast({
          title: "Transcripción completada",
          description: "Ahora vamos a generar tu estrategia personalizada"
        })
      }, 5000)
    } else {
      setIsRecording(false)
    }
  }

  const generateStrategy = async () => {
    setIsGenerating(true)
    
    // Simular llamada a AI para generar estrategia
    setTimeout(() => {
      setStrategy({
        summary: {
          businessType: "Fintech para Freelancers",
          targetUsers: "1,000 usuarios",
          timeline: "3 meses",
          budget: "$15,000"
        },
        audience: {
          primary: "Freelancers Tech (25-35 años)",
          secondary: "Consultores independientes (30-40 años)",
          psychographics: "Buscan control financiero, valoran la autonomía, tech-savvy"
        },
        positioning: {
          headline: "La única app financiera diseñada específicamente para freelancers",
          value_props: [
            "Facturación automatizada con seguimiento de pagos",
            "Separación automática de impuestos",
            "Dashboard de ingresos proyectados",
            "Integración con bancos y plataformas de pago"
          ]
        },
        channels: [
          {
            name: "LinkedIn Ads",
            budget: "$6,000",
            expected_users: 400,
            cpa: "$15",
            timeline: "Mes 1-3"
          },
          {
            name: "Google Ads (Search)",
            budget: "$4,500",
            expected_users: 300,
            cpa: "$15",
            timeline: "Mes 1-3"
          },
          {
            name: "Facebook/Instagram",
            budget: "$3,000",
            expected_users: 200,
            cpa: "$15",
            timeline: "Mes 2-3"
          },
          {
            name: "Content Marketing",
            budget: "$1,500",
            expected_users: 100,
            cpa: "$15",
            timeline: "Mes 1-3"
          }
        ],
        campaigns: [
          {
            platform: "LinkedIn",
            campaign_name: "Freelancer Financial Control",
            ad_copy: "¿Cansado de perder el control de tus finanzas como freelancer? Descubre la app que automatiza tu gestión financiera.",
            targeting: "Freelancers, Consultants, Age 25-40, Income $50k+",
            budget_daily: "$67",
            duration: "90 días"
          }
        ],
        metrics: {
          target_cpa: "$15",
          expected_conversion_rate: "2.5%",
          lifetime_value: "$120",
          payback_period: "8 meses"
        }
      })
      setIsGenerating(false)
      setCurrentStep(3)
      toast({
        title: "Estrategia generada",
        description: "Tu plan de lanzamiento personalizado está listo"
      })
    }, 3000)
  }

  const createCampaigns = () => {
    toast({
      title: "Campañas en preparación",
      description: "Se están configurando las campañas automáticamente..."
    })
    
    setTimeout(() => {
      toast({
        title: "Campañas creadas",
        description: "3 campañas configuradas y listas para lanzar"
      })
      setCurrentStep(4)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Launch Strategy Generator</h2>
            <Badge variant="outline">
              Paso {currentStep} de 4
            </Badge>
          </div>
          <Progress value={(currentStep / 4) * 100} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Voice Input</span>
            <span>AI Analysis</span>
            <span>Strategy</span>
            <span>Deploy</span>
          </div>
        </CardContent>
      </Card>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Describe tu negocio y objetivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <Button
                size="lg"
                onClick={handleVoiceRecording}
                className={`w-32 h-32 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              <p className="mt-4 text-gray-600">
                {isRecording 
                  ? "Grabando... Describe tu negocio, audiencia y metas"
                  : "Haz clic para grabar tu estrategia de negocio"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💼 Sobre tu negocio:</h4>
                <ul className="space-y-1">
                  <li>• ¿Qué problema resuelves?</li>
                  <li>• ¿Cuál es tu modelo de negocio?</li>
                  <li>• ¿Qué te diferencia?</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Sobre tus objetivos:</h4>
                <ul className="space-y-1">
                  <li>• ¿Cuántos usuarios quieres?</li>
                  <li>• ¿En qué tiempo?</li>
                  <li>• ¿Cuál es tu presupuesto?</li>
                </ul>
              </div>
            </div>

            {transcription && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transcripción:</h4>
                <p className="text-sm">{transcription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Análisis AI en progreso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600">Analizando tu mercado y generando estrategia...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">Tu input ha sido procesado. ¿Listo para generar tu estrategia personalizada?</p>
                  <Button onClick={generateStrategy} size="lg" className="bg-gradient-to-r from-blue-600 to-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Generar Estrategia
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Procesando:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Análisis de audiencia objetivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Investigación de competencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span>Optimización de canales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Creación de campañas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && strategy && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Tu Estrategia de Lanzamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="audience">Audiencia</TabsTrigger>
                  <TabsTrigger value="channels">Canales</TabsTrigger>
                  <TabsTrigger value="campaigns">Campañas</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Objetivos
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Usuarios objetivo:</strong> {strategy.summary.targetUsers}</p>
                        <p><strong>Plazo:</strong> {strategy.summary.timeline}</p>
                        <p><strong>Presupuesto:</strong> {strategy.summary.budget}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Métricas Esperadas
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>CPA objetivo:</strong> {strategy.metrics.target_cpa}</p>
                        <p><strong>Conversión:</strong> {strategy.metrics.expected_conversion_rate}</p>
                        <p><strong>LTV:</strong> {strategy.metrics.lifetime_value}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audience" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Audiencia Primaria</h4>
                      <p className="text-sm">{strategy.audience.primary}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Perfil Psicográfico</h4>
                      <p className="text-sm">{strategy.audience.psychographics}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="channels" className="space-y-4">
                  <div className="grid gap-4">
                    {strategy.channels.map((channel: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{channel.name}</h4>
                          <Badge>{channel.timeline}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Presupuesto:</span>
                            <p className="font-medium">{channel.budget}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Usuarios esperados:</span>
                            <p className="font-medium">{channel.expected_users}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">CPA:</span>
                            <p className="font-medium">{channel.cpa}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4">
                  {strategy.campaigns.map((campaign: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{campaign.campaign_name}</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">Copy del anuncio:</span>
                          <p className="italic">"{campaign.ad_copy}"</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Targeting:</span>
                          <p>{campaign.targeting}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Presupuesto diario:</span>
                            <p className="font-medium">{campaign.budget_daily}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duración:</span>
                            <p className="font-medium">{campaign.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-4">
                <Button onClick={createCampaigns} className="bg-gradient-to-r from-blue-600 to-green-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Crear Campañas Automáticamente
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Exportar Estrategia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Campañas Creadas y Listas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">¡Listo para lanzar!</h3>
              <p className="text-gray-600">Tus campañas están configuradas y listas para activar</p>
            </div>

            <div className="grid gap-4">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">LinkedIn - Freelancer Financial Control</h4>
                    <p className="text-sm text-gray-600">Configurada y lista para lanzar</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Activar
                  </Button>
                </div>
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Google Ads - Gestión Financiera Freelancer</h4>
                    <p className="text-sm text-gray-600">Configurada y lista para lanzar</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Revisar
                  </Button>
                </div>
              </div>

              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Facebook/Instagram - Autonomía Financiera</h4>
                    <p className="text-sm text-gray-600">En preparación</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Pendiente
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Nueva Estrategia
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir a Dashboard de Campañas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
