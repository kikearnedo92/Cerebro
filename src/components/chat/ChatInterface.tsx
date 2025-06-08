
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User } from 'lucide-react'
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

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

      // Prepare messages for OpenAI
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }))

      // Get AI response
      const completion = await createChatCompletion(chatMessages, fileContent)
      
      let fullResponse = ''
      setStreamingMessage('')

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || ''
        fullResponse += content
        setStreamingMessage(fullResponse)
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
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Retorna AI</span>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 && !streamingMessage ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">¡Hola! Soy Retorna AI</h1>
                <p className="text-gray-600 text-lg">
                  Tu asistente inteligente interno. ¿En qué puedo ayudarte?
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : ''}`}>
                      <Card className={`p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-white ml-auto'
                          : 'bg-gray-50'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </Card>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {streamingMessage && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="max-w-2xl">
                      <Card className="p-4 bg-gray-50">
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
      <footer className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2 items-end"
          >
            <FileUpload onFileUpload={handleFileUpload} />
            
            <div className="flex-1">
              <Input
                placeholder="Pregúntame sobre Retorna..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="min-h-[44px] resize-none"
              />
            </div>
            
            <Button
              type="submit"
              disabled={(!inputMessage.trim() && !loading) || loading}
              className="h-[44px] px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Retorna AI puede cometer errores. Verifica información importante.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ChatInterface
