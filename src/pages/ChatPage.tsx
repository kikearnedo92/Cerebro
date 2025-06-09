
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, RotateCcw, FileText } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'

const ChatPage = () => {
  const { messages, loading, sendMessage, clearMessages } = useChat()
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return
    
    await sendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Welcome message when no messages
  useEffect(() => {
    if (messages.length === 0 && user) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant' as const,
        content: `¡Hola ${user.email}! 👋

Soy **Cerebro**, tu asistente de IA de Retorna. Estoy aquí para ayudarte con información sobre:

🔹 **Documentos internos** - Políticas, procedimientos, manuales
🔹 **Atención al cliente** - Scripts y mejores prácticas  
🔹 **Investigaciones** - Estudios de mercado y análisis
🔹 **Procesos operativos** - Workflows y procedimientos
🔹 **Compliance** - Normativas y regulaciones

¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
        sources: undefined
      }
      
      // Only show welcome if no real messages
      if (messages.length === 0) {
        // This is just for display, not added to actual messages state
      }
    }
  }, [user, messages.length])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat con Cerebro</h1>
              <p className="text-sm text-gray-600">Asistente de IA de Retorna</p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearMessages}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nueva conversación</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Hola {user?.email?.split('@')[0]}! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  Soy <strong>Cerebro</strong>, tu asistente de IA de Retorna. Puedo ayudarte con:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Documentos internos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Atención al cliente</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Investigaciones</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Compliance</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Escribe tu pregunta abajo para comenzar
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-purple-600' : 'bg-purple-100'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : message.isError 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white'
                  }`}>
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Fuentes:</span>
                      {message.sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-xs ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Cerebro está pensando</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregúntale a Cerebro sobre Retorna..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Presiona Enter para enviar • Los datos pueden no ser exactos, verifica información importante.
        </p>
      </div>
    </div>
  )
}

export default ChatPage
