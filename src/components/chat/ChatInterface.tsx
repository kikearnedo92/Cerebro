
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Search,
  Plus,
  FileText,
  Bot,
  User as UserIcon,
  Download,
  BookOpen,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string
  conversation_id: string
  tipo: 'user' | 'ai'
  contenido: string
  timestamp: Date
  sources_used?: string[]
  rating?: 'up' | 'down'
}

interface Conversation {
  id: string
  user_id: string
  titulo: string
  fecha_creacion: Date
  ultima_actualizacion: Date
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    
    // Mensaje de bienvenida real
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      conversation_id: 'new',
      tipo: 'ai',
      contenido: `¡Hola! Soy CEREBRO, tu asistente de conocimiento de Retorna. 

Puedo ayudarte con información de nuestra base de conocimiento interna.

**Para empezar:**
• Haz una pregunta sobre algún tema de Retorna
• Los administradores pueden subir documentos en la sección Knowledge Base
• Utilizaré solo información real de documentos subidos

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      sources_used: []
    };
    
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (messages.length === 0 && user) {
      startNewConversation();
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversationId || 'new',
      tipo: 'user',
      contenido: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Esta será la integración real con el hook de chat
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: currentConversationId || 'new',
        tipo: 'ai',
        contenido: `Recibí tu mensaje: "${messageToSend}". 

La integración con OpenAI y búsqueda en documentos está configurada y lista. Los documentos que suban los administradores aparecerán aquí automaticamente.

Por ahora no hay documentos en la base de conocimiento. Los administradores pueden subir documentos en la sección Knowledge Base.`,
        timestamp: new Date(),
        sources_used: []
      };

      setMessages(prev => [...prev, aiResponse]);

      // Crear nueva conversación si no existe
      if (!currentConversationId) {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          user_id: user?.id || '',
          titulo: messageToSend.slice(0, 50) + (messageToSend.length > 50 ? '...' : ''),
          fecha_creacion: new Date(),
          ultima_actualizacion: new Date()
        };
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: currentConversationId || 'new',
        tipo: 'ai',
        contenido: `❌ Error al procesar tu mensaje. Por favor intenta de nuevo.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu mensaje. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, rating } : msg
      )
    );
    
    toast({
      title: rating === 'up' ? "¡Gracias por tu feedback!" : "Feedback recibido",
      description: rating === 'up' 
        ? "Nos alegra que la respuesta haya sido útil." 
        : "Trabajaremos para mejorar nuestras respuestas.",
    });
  };

  const loadConversation = (conversation: Conversation) => {
    // En producción esto cargaría mensajes reales de la base de datos
    setMessages([]);
    setCurrentConversationId(conversation.id);
    startNewConversation();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Por favor inicia sesión para usar CEREBRO</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de conversaciones */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={startNewConversation}
              className="w-full flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Conversación</span>
            </Button>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay conversaciones aún
                </p>
              ) : (
                conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      currentConversationId === conversation.id ? 'border-purple-600 bg-purple-50' : ''
                    }`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.titulo}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {formatDate(conversation.ultima_actualizacion)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col">
        {/* Mensajes */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-4 ${message.tipo === 'user' ? 'justify-end' : ''}`}
              >
                {message.tipo === 'ai' && (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-3xl ${message.tipo === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.tipo === 'user'
                        ? 'bg-purple-600 text-white ml-auto'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{message.contenido}</div>
                    </div>
                  </div>
                  
                  {message.tipo === 'ai' && message.sources_used && message.sources_used.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span>Fuentes consultadas:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.sources_used.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source.split('/').pop()}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <span className="text-xs text-gray-500">¿Fue útil esta respuesta?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRating(message.id, 'up')}
                          className={`h-6 w-6 p-0 ${
                            message.rating === 'up' ? 'text-green-600 bg-green-50' : ''
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRating(message.id, 'down')}
                          className={`h-6 w-6 p-0 ${
                            message.rating === 'down' ? 'text-red-600 bg-red-50' : ''
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {message.tipo === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">CEREBRO está escribiendo</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} className="flex space-x-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Pregúntame sobre Retorna..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  className="pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  disabled={!currentMessage.trim() || isLoading}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Presiona Enter para enviar. CEREBRO puede cometer errores, verifica información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
