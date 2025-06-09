
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Brain, User, Copy, Search } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { createChatCompletion } from '@/lib/openai'
import { Message, Conversation } from '@/types/database'
import FileUpload from './FileUpload'
import { toast } from '@/hooks/use-toast'

const ChatInterface = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingMessage, setStreamingMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Focus input on Cmd+K
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  const searchKnowledgeBase = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('active', true)
        .textSearch('content', query.split(' ').join(' | '))
        .limit(3)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching knowledge base:', error)
      return []
    }
  }

  const createNewConversation = async (title: string): Promise<Conversation> => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user!.id,
        title: title.slice(0, 50)
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado",
        description: "Texto copiado al portapapeles"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el texto",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async (fileContent?: string, filename?: string) => {
    if ((!inputMessage.trim() && !fileContent) || loading) return

    const messageContent = fileContent 
      ? `${inputMessage}\n\n[Archivo adjunto: ${filename}]`
      : inputMessage

    setLoading(true)
    setInputMessage('')

    try {
      // Create conversation if needed
      let conversation = currentConversation
      if (!conversation) {
        conversation = await createNewConversation(inputMessage || 'Nueva conversación')
        setCurrentConversation(conversation)
      }

      // Save user message
      const userMessage = await saveMessage(conversation.id, 'user', messageContent)
      setMessages(prev => [...prev, userMessage])

      // Search knowledge base first
      const knowledgeResults = await searchKnowledgeBase(inputMessage)
      let knowledgeContext = ''
      let sources: string[] = []

      if (knowledgeResults.length > 0) {
        knowledgeContext = '\n\nInformación específica de Retorna encontrada:\n'
        knowledgeResults.forEach((item, index) => {
          knowledgeContext += `${index + 1}. ${item.title}\n${item.content}\n\n`
          sources.push(item.title)
        })
      }

      // Prepare messages for OpenAI
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }))

      // Get AI response with knowledge context
      const completion = await createChatCompletion(chatMessages, fileContent + knowledgeContext)
      
      let fullResponse = ''
      setStreamingMessage('')

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || ''
        fullResponse += content
        setStreamingMessage(fullResponse)
      }

      // Add sources to response if found
      if (sources.length > 0) {
        fullResponse += `\n\n📚 **Fuentes consultadas:**\n${sources.map(source => `• ${source}`).join('\n')}`
      }

      // Save AI response
      if (fullResponse) {
        const aiMessage = await saveMessage(conversation.id, 'assistant', fullResponse)
        setMessages(prev => [...prev, aiMessage])
      }
      
      setStreamingMessage('')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el mensaje",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (fileContent: string, filename: string) => {
    handleSendMessage(fileContent, filename)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-purple-50/30">
      {/* Chat area */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 && !streamingMessage ? (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-pulse-purple">
                    <Brain className="w-10 h-10 text-white brain-glow" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold cerebro-brand mb-3">¡Hola! Soy CEREBRO</h1>
                <p className="text-gray-600 text-lg mb-4">
                  Tu plataforma de conocimiento inteligente de Retorna
                </p>
                <p className="text-gray-500 text-sm">
                  Pregúntame sobre políticas, procedimientos, análisis de mercado y más...
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-600 border border-purple-200">
                    💡 Presiona <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Cmd+K</kbd> para enfocar la búsqueda
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-1' : ''}`}>
                      <Card className={`p-4 relative group ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white ml-auto shadow-lg'
                          : 'bg-white shadow-sm border-purple-100'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </Card>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {streamingMessage && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="max-w-3xl">
                      <Card className="p-4 bg-white shadow-sm border-purple-100">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{streamingMessage}</div>
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>

      {/* Input area */}
      <footer className="border-t bg-white/80 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2 items-end"
          >
            <FileUpload onFileUpload={handleFileUpload} />
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Pregúntame sobre Retorna... (Cmd+K)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="min-h-[44px] pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
            
            <Button
              type="submit"
              disabled={(!inputMessage.trim() && !loading) || loading}
              className="h-[44px] px-4 bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Cerebro puede cometer errores. Verifica información importante con las fuentes oficiales.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ChatInterface
