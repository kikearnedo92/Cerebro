import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, Send, Brain, Target, TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface GTMStrategy {
  targetAudience: string
  positioning: string
  channels: string[]
  contentCalendar: Array<{ week: string; content: string; channel: string }>
  pricing: { tier: string; price: string; features: string[] }[]
  competition: { name: string; strength: string; weakness: string }[]
  metrics: string[]
  timeline: Array<{ phase: string; duration: string; activities: string[] }>
}

export const VoiceStrategyGenerator = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [strategy, setStrategy] = useState<GTMStrategy | null>(null)
  const [generatingStrategy, setGeneratingStrategy] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const questions = [
    "¿Cuál es tu target audience exacto? Describe demografía, comportamiento y necesidades específicas.",
    "¿Cuál es tu modelo de monetización? ¿Cómo planeas generar ingresos?",
    "¿Quiénes son tus 3 competidores principales y qué te diferencia de ellos?",
    "¿Cuál es tu presupuesto de marketing mensual para los próximos 6 meses?",
    "¿Cuáles son tus canales preferidos? (Social media, content marketing, paid ads, partnerships, etc.)",
    "¿Cuál es tu timeline ideal para el lanzamiento y primeras métricas?"
  ]

  useEffect(() => {
    if (conversation.length === 0 && questions.length > 0) {
      setConversation([{
        role: 'assistant',
        content: `¡Perfecto! Voy a ayudarte a crear una estrategia GTM completa para NÚCLEO. Empecemos con la primera pregunta:\n\n${questions[0]}`
      }])
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true 
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      
      toast({
        title: "Grabando audio",
        description: "Habla claramente sobre tu estrategia de lanzamiento"
      })
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Error",
        description: "No se puede acceder al micrófono. Usa la opción de texto.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1]
        
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        })

        if (error) {
          throw new Error(error.message)
        }

        const transcription = data.text
        setTextInput(transcription)
        
        toast({
          title: "Audio procesado",
          description: "Transcripción completada. Puedes editarla antes de enviar."
        })
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      toast({
        title: "Error",
        description: "Error procesando el audio. Intenta con texto.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!textInput.trim()) return

    const userMessage = textInput.trim()
    setConversation(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Store answer
    const questionKey = `question_${currentQuestion}`
    setAnswers(prev => ({ ...prev, [questionKey]: userMessage }))
    
    setTextInput('')
    setIsProcessing(true)

    try {
      // Generate AI response
      const { data, error } = await supabase.functions.invoke('launch-strategy-ai', {
        body: {
          userMessage,
          currentQuestion,
          answers: { ...answers, [questionKey]: userMessage },
          totalQuestions: questions.length
        }
      })

      if (error) throw error

      const assistantResponse = data.response
      setConversation(prev => [...prev, { role: 'assistant', content: assistantResponse }])

      // Move to next question or generate strategy
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setTimeout(() => {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: `Perfecto. Siguiente pregunta:\n\n${questions[currentQuestion + 1]}`
          }])
        }, 1000)
      } else {
        // All questions answered, generate strategy
        generateGTMStrategy()
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Error procesando tu respuesta. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generateGTMStrategy = async () => {
    setGeneratingStrategy(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-gtm-strategy', {
        body: { answers }
      })

      if (error) throw error

      setStrategy(data.strategy)
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "¡Excelente! He generado tu estrategia GTM completa basada en tus respuestas. Revisa todos los detalles abajo y dime si quieres ajustar algo específico."
      }])

      toast({
        title: "¡Estrategia generada!",
        description: "Tu plan GTM completo está listo para ejecutar"
      })

    } catch (error) {
      console.error('Error generating strategy:', error)
      toast({
        title: "Error",
        description: "Error generando la estrategia. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setGeneratingStrategy(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            Launch Strategy Generator
            <Badge variant="outline" className="bg-green-50 text-green-700">
              AI-Powered GTM
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentQuestion + 1}</div>
              <div className="text-sm text-gray-600">Pregunta Actual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Total Preguntas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((currentQuestion / questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {strategy ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Estrategia Lista</div>
            </div>
          </div>
          <Progress value={(currentQuestion / questions.length) * 100} className="mb-4" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Conversación Estratégica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {conversation.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-8 text-blue-900' 
                    : 'bg-white mr-8 border shadow-sm'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && <Brain className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {(isProcessing || generatingStrategy) && (
                <div className="bg-white mr-8 border shadow-sm p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                    <div className="text-sm text-gray-600">
                      {generatingStrategy ? 'Generando estrategia GTM completa...' : 'Procesando...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Detener' : 'Grabar'}
                </Button>
                <div className="text-sm text-gray-600 flex items-center">
                  Usa voz o escribe tu respuesta
                </div>
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu respuesta aquí o usa el botón de grabación..."
                  className="flex-1"
                  rows={3}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!textInput.trim() || isProcessing}
                  size="sm"
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Overview */}
        {strategy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Estrategia GTM Generada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Target Audience</h4>
                <p className="text-sm">{strategy.targetAudience}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Positioning</h4>
                <p className="text-sm">{strategy.positioning}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Canales Principales</h4>
                <div className="flex flex-wrap gap-1">
                  {strategy.channels.map((channel, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{channel}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Exportar Estrategia
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Crear Timeline
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Setup Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Strategy Display */}
      {strategy && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Content Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Content Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategy.contentCalendar.slice(0, 4).map((item, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{item.week}</div>
                    <div className="text-gray-600">{item.content}</div>
                    <Badge variant="outline" className="text-xs mt-1">{item.channel}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4" />
                Pricing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategy.pricing.map((tier, i) => (
                  <div key={i} className="p-2 border rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{tier.tier}</span>
                      <span className="text-sm text-green-600">{tier.price}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {tier.features.slice(0, 2).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competition Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Competidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategy.competition.map((comp, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{comp.name}</div>
                    <div className="text-xs text-green-600">+ {comp.strength}</div>
                    <div className="text-xs text-red-600">- {comp.weakness}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
