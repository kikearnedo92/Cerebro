
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Upload, X, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { toast } from '@/hooks/use-toast'

const ChatInterface = () => {
  const { user } = useAuth()
  const { messages, loading, sendMessage, clearMessages } = useChat()
  const { uploadFile, isUploading } = useKnowledgeBase()
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return

    // Upload files first if any
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        try {
          await uploadFile(file, {
            title: file.name.replace(/\.[^/.]+$/, ""),
            project: 'Chat Upload',
            tags: ['chat', 'uploaded']
          })
        } catch (error) {
          console.error('File upload failed:', error)
        }
      }
      setSelectedFiles([])
    }

    // Send message
    if (inputMessage.trim()) {
      await sendMessage(inputMessage)
      setInputMessage('')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bienvenido a Cerebro</h2>
            <p className="text-gray-600">Inicia sesión para comenzar a chatear con la IA</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Cerebro AI</h1>
            <p className="text-sm text-gray-500">Asistente inteligente de Retorna</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearMessages}>
          Nueva conversación
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Hola! Soy Cerebro</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Soy tu asistente de IA entrenado con el conocimiento de Retorna. 
              Puedes preguntarme sobre procesos, políticas, procedimientos o subir documentos.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-purple-600' 
                  : message.isError 
                    ? 'bg-red-500' 
                    : 'bg-gray-600'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-white border border-gray-200'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Fuentes consultadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-500">Cerebro está pensando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Area */}
      {selectedFiles.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregúntale algo a Cerebro o sube un documento..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={loading || (!inputMessage.trim() && selectedFiles.length === 0)}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
