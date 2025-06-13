
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, RotateCcw, FileText, Brain, Zap } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'

const ChatPage = () => {
  const { messages, loading, chatMode, sendMessage, clearMessages, toggleChatMode } = useChat()
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
          
          <div className="flex items-center space-x-2">
            {/* Chat Mode Selector */}
            <Button
              variant={chatMode === 'retorna' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleChatMode}
              className="flex items-center space-x-2"
            >
              {chatMode === 'retorna' ? (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Cerebro (Retorna)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>OpenAI General</span>
                </>
              )}
            </Button>

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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {chatMode === 'retorna' ? (
                    <Brain className="w-8 h-8 text-purple-600" />
                  ) : (
                    <Zap className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Hola {user?.email?.split('@')[0]}! 👋
                </h2>
                {chatMode === 'retorna' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Modo <strong>OpenAI General</strong> activado. Puedo ayudarte con cualquier pregunta general.
                    </p>
                    <p className="text-sm text-gray-500">
                      En este modo tengo acceso a conocimiento general, no específico de Retorna.
                    </p>
                  </>
                )}
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
                    <span className="text-sm text-gray-500">
                      {chatMode === 'retorna' ? 'Cerebro' : 'OpenAI'} está pensando
                    </span>
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
            placeholder={
              chatMode === 'retorna' 
                ? "Pregúntale a Cerebro sobre Retorna..." 
                : "Pregunta cualquier cosa a OpenAI..."
            }
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
          Presiona Enter para enviar • Modo actual: {chatMode === 'retorna' ? 'Cerebro (Retorna)' : 'OpenAI General'}
        </p>
      </div>
    </div>
  )
}

export default ChatPage
