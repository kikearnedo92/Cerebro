
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Message, Conversation } from '@/types';
import { toast } from '@/hooks/use-toast';

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversations para el demo
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        user_id: user?.id || '',
        titulo: 'Políticas de remesas a Colombia',
        fecha_creacion: new Date(Date.now() - 86400000), // Ayer
        ultima_actualizacion: new Date(Date.now() - 86400000),
      },
      {
        id: '2',
        user_id: user?.id || '',
        titulo: 'Scripts de atención al cliente',
        fecha_creacion: new Date(Date.now() - 172800000), // Hace 2 días
        ultima_actualizacion: new Date(Date.now() - 172800000),
      },
      {
        id: '3',
        user_id: user?.id || '',
        titulo: 'Normativas de compliance Brasil',
        fecha_creacion: new Date(Date.now() - 604800000), // Hace 1 semana
        ultima_actualizacion: new Date(Date.now() - 604800000),
      }
    ];
    setConversations(mockConversations);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    
    // Mensaje de bienvenida
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      conversation_id: 'new',
      tipo: 'ai',
      contenido: `¡Hola ${user?.nombre}! Soy Retorna AI, tu asistente inteligente interno. Puedo ayudarte con:

• **Atención al Cliente**: Scripts de respuesta, resolución de casos
• **Investigaciones**: Análisis de mercado y estudios
• **Políticas por País**: Chile, Colombia, España, Venezuela, Brasil, Perú
• **Procedimientos Operativos**: Procesos internos y workflows
• **Compliance**: Normativas y regulaciones
• **Scripts de Respuesta**: Para diferentes situaciones

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      sources_used: []
    };
    
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (messages.length === 0) {
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
    setCurrentMessage('');
    setIsLoading(true);

    // Simular respuesta del AI
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: currentConversationId || 'new',
        tipo: 'ai',
        contenido: generateAIResponse(currentMessage),
        timestamp: new Date(),
        sources_used: [
          'Políticas-País/Colombia/Regulaciones-2024.pdf',
          'Procedimientos-Operativos/ATC-Guidelines.docx',
          'Scripts-Respuesta/Remesas-Internacionales.txt'
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      // Crear nueva conversación si no existe
      if (!currentConversationId) {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          user_id: user?.id || '',
          titulo: currentMessage.slice(0, 50) + (currentMessage.length > 50 ? '...' : ''),
          fecha_creacion: new Date(),
          ultima_actualizacion: new Date()
        };
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
      }
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    // Mock responses basadas en palabras clave
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('colombia') || lowerQuestion.includes('remesa')) {
      return `Sobre las remesas a Colombia, aquí tienes la información más relevante:

**Regulaciones Actuales:**
• Monto máximo por transacción: USD $10,000
• Documentación requerida: Cédula del receptor y remitente
• Tiempo de procesamiento: 1-3 días hábiles
• Comisión estándar: 2.5% del monto enviado

**Procedimiento Operativo:**
1. Verificar identidad del remitente
2. Validar datos del beneficiario
3. Confirmar propósito de la remesa
4. Procesar pago según método seleccionado

**Scripts de Respuesta:**
"Su remesa a Colombia será procesada en un máximo de 3 días hábiles. El beneficiario recibirá notificación por SMS cuando esté disponible para retiro."

¿Necesitas información específica sobre algún aspecto particular?`;
    }
    
    if (lowerQuestion.includes('atención') || lowerQuestion.includes('cliente') || lowerQuestion.includes('script')) {
      return `Aquí tienes los scripts principales de atención al cliente:

**Script de Bienvenida:**
"¡Hola! Bienvenido a Retorna. Mi nombre es [Nombre] y estaré ayudándote hoy. ¿En qué puedo asistirte?"

**Script para Consulta de Estado:**
"Para verificar el estado de tu remesa, necesito que me proporciones el código de transacción. Una vez lo tenga, podré darte información actualizada en tiempo real."

**Script para Problemas de Entrega:**
"Entiendo tu preocupación. Voy a revisar inmediatamente el estado de tu transacción y coordinar con nuestro equipo para resolver cualquier inconveniente."

**Escalación a Supervisor:**
"Voy a transferir tu caso a mi supervisor para que pueda ayudarte de manera más especializada. El tiempo de espera será de aproximadamente 2-3 minutos."

¿Necesitas algún script específico para una situación particular?`;
    }
    
    return `He analizado tu consulta y aquí tienes una respuesta basada en nuestro conocimiento interno:

Esta información proviene de nuestras bases de datos actualizadas de políticas, procedimientos y mejores prácticas de Retorna.

**Puntos Clave:**
• Información verificada según nuestros protocolos internos
• Datos actualizados con las últimas regulaciones
• Procedimientos alineados con compliance internacional

**Recomendaciones:**
1. Seguir los procedimientos estándar establecidos
2. Documentar todas las interacciones apropiadamente
3. Escalar a supervisión si es necesario

¿Te gustaría que profundice en algún aspecto específico o necesitas información adicional sobre otro tema?`;
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
    // Mock: cargar mensajes de la conversación
    const mockMessages: Message[] = [
      {
        id: '1',
        conversation_id: conversation.id,
        tipo: 'user',
        contenido: conversation.titulo,
        timestamp: conversation.fecha_creacion
      },
      {
        id: '2',
        conversation_id: conversation.id,
        tipo: 'ai',
        contenido: 'Esta es una respuesta de ejemplo para la conversación seleccionada.',
        timestamp: conversation.fecha_creacion,
        sources_used: ['ejemplo.pdf']
      }
    ];
    
    setMessages(mockMessages);
    setCurrentConversationId(conversation.id);
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

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de conversaciones */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={startNewConversation}
              className="w-full flex items-center space-x-2 bg-primary hover:bg-primary-700"
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
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    currentConversationId === conversation.id ? 'border-primary bg-primary-50' : ''
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
              ))}
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
                className={`flex space-x-4 ${message.tipo === 'user' ? 'justify-end' : ''} message-enter`}
              >
                {message.tipo === 'ai' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-3xl ${message.tipo === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.tipo === 'user'
                        ? 'bg-primary text-white ml-auto'
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
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
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
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Retorna AI está escribiendo</span>
                    <div className="flex space-x-1">
                      <div className="typing-indicator"></div>
                      <div className="typing-indicator"></div>
                      <div className="typing-indicator"></div>
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
              Presiona Enter para enviar. Retorna AI puede cometer errores, verifica información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
