import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Phone, Mail, MessageSquare, Users, Settings, Target } from 'lucide-react'

interface EscalationContact {
  name: string
  role: string
  department: string
  email: string
  phone?: string
  triggers: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface SmartEscalationSuggestion {
  contact: EscalationContact
  template: string
  confidence: number
  reason: string
  matchedTriggers: string[]
}

interface SmartEscalationEngineProps {
  message: string
  onSuggestionApply: (suggestion: SmartEscalationSuggestion) => void
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
}

// Configuración de contactos de escalación
const ESCALATION_CONTACTS: EscalationContact[] = [
  {
    name: 'Joel Campos',
    role: 'Head de Tesorería',
    department: 'Tesorería',
    email: 'joel.campos@retorna.app',
    phone: '+57 300 123 4567',
    triggers: ['precio', 'tasa', 'comisión', 'tarifa', 'saldo', 'transferencia', 'dinero', 'pago', 'costo', 'fee', 'rate'],
    priority: 'high'
  },
  {
    name: 'Daniela Zanotti',
    role: 'Head de Compliance',
    department: 'Compliance',
    email: 'daniela.zanotti@retorna.app',
    triggers: ['compliance', 'regulación', 'normativa', 'aml', 'kyc', 'lavado', 'activos', 'regulatorio', 'legal', 'normativo'],
    priority: 'high'
  },
  {
    name: 'Soporte Técnico',
    role: 'Tech Support',
    department: 'Tecnología',
    email: 'soporte@retorna.app',
    triggers: ['error', 'bug', 'falla', 'problema técnico', 'sistema', 'app no funciona', 'no carga'],
    priority: 'medium'
  }
]

const SmartEscalationEngine: React.FC<SmartEscalationEngineProps> = ({ 
  message, 
  onSuggestionApply, 
  enabled = false,
  onEnabledChange 
}) => {
  const [suggestions, setSuggestions] = useState<SmartEscalationSuggestion[]>([])
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    if (enabled && message.trim()) {
      analyzeMessageForEscalation()
    } else {
      setSuggestions([])
    }
  }, [message, enabled])

  const analyzeMessageForEscalation = () => {
    const messageText = message.toLowerCase()
    const newSuggestions: SmartEscalationSuggestion[] = []

    ESCALATION_CONTACTS.forEach(contact => {
      const matchedTriggers: string[] = []
      let confidence = 0

      // Buscar triggers en el mensaje
      contact.triggers.forEach(trigger => {
        if (messageText.includes(trigger.toLowerCase())) {
          matchedTriggers.push(trigger)
          confidence += 1 / contact.triggers.length // Normalizar por número de triggers
        }
      })

      // Solo sugerir si hay al menos un trigger match
      if (matchedTriggers.length > 0) {
        const suggestion: SmartEscalationSuggestion = {
          contact,
          template: generateEscalationTemplate(contact, matchedTriggers),
          confidence: Math.min(confidence, 1.0), // Máximo 1.0
          reason: `Detecté términos relacionados con ${contact.department.toLowerCase()}: ${matchedTriggers.join(', ')}`,
          matchedTriggers
        }

        newSuggestions.push(suggestion)
      }
    })

    // Ordenar por confianza descendente
    newSuggestions.sort((a, b) => b.confidence - a.confidence)
    setSuggestions(newSuggestions.slice(0, 2)) // Máximo 2 sugerencias
  }

  const generateEscalationTemplate = (contact: EscalationContact, triggers: string[]) => {
    const baseTemplate = `Hola ${contact.name},

Tengo una consulta relacionada con ${triggers.join(', ')} que necesita tu experiencia en ${contact.department}.

Contexto: "${message}"

¿Podrías ayudarme con esta consulta?

Gracias,`

    return baseTemplate
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Target className="w-4 h-4" />
      case 'low':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Smart Escalation Engine
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="escalation-enabled"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
            <Label htmlFor="escalation-enabled" className="text-sm text-purple-700">
              Activado
            </Label>
          </div>
        </div>
        {enabled && (
          <p className="text-xs text-purple-600 mt-2">
            Detectando automáticamente necesidades de escalación basado en el contenido del mensaje
          </p>
        )}
      </CardHeader>
      
      {enabled && suggestions.length > 0 && (
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white/70 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant={getPriorityColor(suggestion.contact.priority)} className="flex items-center gap-1">
                    {getPriorityIcon(suggestion.contact.priority)}
                    {suggestion.contact.priority.toUpperCase()}
                  </Badge>
                  <div className="flex flex-col">
                    <span className="text-sm text-purple-600 font-medium">{suggestion.reason}</span>
                    <span className="text-xs text-purple-500">
                      Confianza: {(suggestion.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900">{suggestion.contact.name}</h4>
                    <p className="text-sm text-purple-600">{suggestion.contact.role} • {suggestion.contact.department}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-purple-500">
                        <Mail className="w-3 h-3" />
                        {suggestion.contact.email}
                      </div>
                      {suggestion.contact.phone && (
                        <div className="flex items-center gap-1 text-xs text-purple-500">
                          <Phone className="w-3 h-3" />
                          {suggestion.contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Template de escalación:</h5>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {suggestion.template}
                  </p>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => onSuggestionApply(suggestion)}
                  className="w-full"
                  variant="default"
                >
                  Aplicar Template
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}

      {enabled && suggestions.length === 0 && message.trim() && (
        <CardContent>
          <div className="text-center py-4 text-purple-600">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se detectaron escalaciones necesarias</p>
            <p className="text-xs text-purple-500">El mensaje no coincide con triggers configurados</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default SmartEscalationEngine