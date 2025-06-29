
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/hooks/useChat'
import { Send, FileText, Trash2, MessageSquare } from 'lucide-react'
import FileUpload from './FileUpload'

const ChatInterface = () => {
  const [message, setMessage] = useState('')
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, sendMessage, clearConversation } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return
    
    await sendMessage(message, useKnowledgeBase)
    setMessage('')
  }

  const handleClearMessages = () => {
    clearConversation()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">CEREBRO Chat</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearMessages}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>¡Hola! Soy CEREBRO, tu asistente de conocimiento interno.</p>
              <p className="text-sm mt-1">Pregúntame sobre procedimientos, políticas o cualquier información de la empresa.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={msg.role === 'user' ? 'text-white' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.documentsFound > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {msg.documentsFound} documentos consultados
                        </Badge>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Fuentes: {msg.sources.slice(0, 2).join(', ')}
                          {msg.sources.length > 2 && ` +${msg.sources.length - 2}`}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">CEREBRO está pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Controls */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2 mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useKnowledgeBase}
              onChange={(e) => setUseKnowledgeBase(e.target.checked)}
              className="rounded"
            />
            Consultar base de conocimiento
          </label>
          <FileUpload />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
