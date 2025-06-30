
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Github, Webhook, Code, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const ProductIntegrationSetup = () => {
  const [activeTab, setActiveTab] = useState('github')
  const [githubUrl, setGithubUrl] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')

  const generateApiKey = () => {
    const key = `nucleo_${Math.random().toString(36).substr(2, 16)}_${Date.now()}`
    setApiKey(key)
    toast({
      title: "API Key generada",
      description: "Copia esta key para integrar con tu producto"
    })
  }

  const testConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus('testing')

    try {
      if (activeTab === 'github') {
        // Test GitHub connection
        const { data, error } = await supabase.functions.invoke('test-github-connection', {
          body: { repositoryUrl: githubUrl }
        })
        
        if (error) throw error
        
        setConnectionStatus('connected')
        toast({
          title: "✅ GitHub conectado",
          description: "AutoDev puede acceder a tu repositorio"
        })
      } else if (activeTab === 'webhook') {
        // Test webhook connection
        const { data, error } = await supabase.functions.invoke('test-webhook-connection', {
          body: { webhookUrl, apiKey }
        })
        
        if (error) throw error
        
        setConnectionStatus('connected')
        toast({
          title: "✅ Webhook conectado",
          description: "Tu producto puede enviar eventos a NÚCLEO"
        })
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('error')
      toast({
        title: "Error de conexión",
        description: "Verifica la URL y permisos",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles"
    })
  }

  const sdkCode = `// Instalar SDK de NÚCLEO
npm install @nucleo/sdk

// Inicializar
import { NucleoSDK } from '@nucleo/sdk'

const nucleo = new NucleoSDK({
  apiKey: '${apiKey || 'TU_API_KEY'}',
  webhookUrl: '${webhookUrl || 'TU_WEBHOOK_URL'}'
})

// Trackear eventos de usuario
nucleo.track('user_action', {
  userId: 'user_123',
  action: 'checkout_started',
  properties: {
    amount: 99.99,
    step: 'payment'
  }
})

// Recibir mejoras automáticas
nucleo.onImprovement((improvement) => {
  console.log('Nueva mejora disponible:', improvement)
  // Aplicar mejora automáticamente o mostrar para aprobación
})`

  const webhookExample = `{
  "event": "user_action",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_123",
  "action": "checkout_abandoned",
  "properties": {
    "step": "payment",
    "amount": 99.99,
    "time_spent": 120
  },
  "metadata": {
    "source": "web_app",
    "version": "1.2.0"
  }
}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conecta Tu Producto a NÚCLEO AutoDev</CardTitle>
          <p className="text-gray-600">
            Elige cómo quieres que NÚCLEO acceda y mejore tu producto automáticamente
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Integration
              </TabsTrigger>
              <TabsTrigger value="webhook" className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Direct Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Opción 1: GitHub Repository</CardTitle>
                  <p className="text-sm text-gray-600">
                    NÚCLEO accede directamente a tu código para generar mejoras
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL del Repositorio</label>
                    <Input
                      placeholder="https://github.com/tu-empresa/tu-producto"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testConnection}
                      disabled={!githubUrl || isConnecting}
                      className="flex-1"
                    >
                      {isConnecting ? 'Conectando...' : 'Conectar GitHub'}
                    </Button>
                    {connectionStatus === 'connected' && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {connectionStatus === 'connected' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Repositorio conectado exitosamente</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        NÚCLEO puede analizar tu código y generar mejoras automáticamente
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Workflow Automático:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1. NÚCLEO detecta fricción en tu producto</div>
                      <div>2. Claude analiza el problema y genera especificaciones</div>
                      <div>3. Lovable implementa la solución</div>
                      <div>4. Se crea Pull Request para tu revisión</div>
                      <div>5. Después de aprobación, se hace deploy automático</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhook" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Opción 2: Integración Directa</CardTitle>
                  <p className="text-sm text-gray-600">
                    Tu producto envía eventos a NÚCLEO para análisis y mejoras
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Webhook URL</label>
                      <Input
                        placeholder="https://tu-producto.com/webhook"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex gap-2">
                        <Input
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Generar API Key"
                          readOnly
                        />
                        <Button variant="outline" size="sm" onClick={generateApiKey}>
                          Generar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={testConnection}
                    disabled={!webhookUrl || !apiKey || isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? 'Probando conexión...' : 'Probar Conexión'}
                  </Button>

                  {connectionStatus === 'connected' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Conexión establecida</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SDK Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Código de integración:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sdkCode)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                      {sdkCode}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Payload Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Estructura de eventos:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webhookExample)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                      {webhookExample}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-gray-300'
              }`} />
              <div>
                <div className="text-sm font-medium">Estado de Conexión</div>
                <div className="text-xs text-gray-600">
                  {connectionStatus === 'connected' ? 'Activo' : 'Sin conectar'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Mejoras Pendientes</div>
                <div className="text-xs text-gray-600">0 en cola</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">Mejoras Implementadas</div>
                <div className="text-xs text-gray-600">0 este mes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
