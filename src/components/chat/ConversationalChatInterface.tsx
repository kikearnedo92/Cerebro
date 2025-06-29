
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Send, 
  User, 
  Bot, 
  Upload, 
  FileText, 
  X,
  Database,
  Search,
  BookOpen,
  Lightbulb,
  CheckCircle2
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  documentsFound?: number
  searchStats?: {
    totalDocuments: number
    usedKnowledgeBase: boolean
  }
}

const ConversationalChatInterface = () => {
  const [input, setInput] = useState('')
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { 
    messages, 
    sendMessage, 
    isLoading, 
    currentConversationId 
  } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 10MB",
          variant: "destructive"
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() && !imageFile) {
      toast({
        title: "Mensaje vacío",
        description: "Por favor escribe un mensaje o sube una imagen",
        variant: "destructive"
      })
      return
    }

    let imageData = null
    if (imageFile) {
      setIsUploading(true)
      try {
        const reader = new FileReader()
        reader.readAsDataURL(imageFile)
        imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result)
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen",
          variant: "destructive"
        })
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    const messageText = input.trim() || 'Analiza esta imagen'
    
    try {
      await sendMessage(messageText, useKnowledgeBase, imageData as string)
      setInput('')
      removeImage()
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CEREBRO</h2>
              <p className="text-sm text-gray-500">Asistente de conocimiento interno</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-500" />
              <Label htmlFor="knowledge-toggle" className="text-sm text-gray-700">
                Base de conocimiento
              </Label>
              <Switch
                id="knowledge-toggle"
                checked={useKnowledgeBase}
                onCheckedChange={setUseKnowledgeBase}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Hola! Soy CEREBRO
            </h3>
            <p className="text-gray-600 mb-6">
              Tu asistente de conocimiento interno. Puedo ayudarte con información de la empresa, 
              procedimientos, políticas y más.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-700">Buscar procedimientos</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">Consultar políticas</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-700">Revisar documentación</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">Obtener sugerencias</span>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}>
                  <div className="flex items-start space-x-3 mb-2">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Card className={`${
                        message.role === 'assistant' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-purple-600 border-purple-600'
                      }`}>
                        <CardContent className="p-4">
                          <div className={`prose prose-sm max-w-none ${
                            message.role === 'assistant' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {message.content.split('\n').map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                          
                          {/* Sources and search stats for assistant messages */}
                          {message.role === 'assistant' && (
                            <div className="mt-4 space-y-3">
                              {/* Search Statistics */}
                              {message.searchStats && (
                                <div className="flex items-center space-x-4 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Database className="w-3 h-3" />
                                    <span>
                                      {message.searchStats.usedKnowledgeBase ? 'Base de conocimiento activa' : 'Sin base de conocimiento'}
                                    </span>
                                  </div>
                                  {message.documentsFound !== undefined && (
                                    <div className="flex items-center space-x-1">
                                      <FileText className="w-3 h-3" />
                                      <span>{message.documentsFound} documentos consultados</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Sources */}
                              {message.sources && message.sources.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-600 flex items-center">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Fuentes consultadas:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.sources.map((source, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.role === 'assistant' ? 'justify-start' : 'justify-end'
                      }`}>
                        {message.role === 'user' && (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Imagen adjunta:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeImage}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 rounded border"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaResize}
                onKeyPress={handleKeyPress}
                placeholder={
                  useKnowledgeBase 
                    ? "Pregunta sobre procedimientos, políticas o cualquier tema empresarial..."
                    : "Escribe tu mensaje..."
                }
                className="min-h-[44px] max-h-[150px] resize-none"
                disabled={isLoading || isUploading}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="h-11 w-11 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || isUploading || (!input.trim() && !imageFile)}
                className="h-11 w-11 p-0 bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {useKnowledgeBase && (
            <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded">
              <Database className="w-3 h-3 mr-2" />
              <span>
                Consultando la base de conocimiento para obtener respuestas más precisas
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ConversationalChatInterface
