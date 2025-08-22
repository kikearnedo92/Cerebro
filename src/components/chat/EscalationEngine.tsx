import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Phone, Mail, MessageSquare, Users } from 'lucide-react'

interface EscalationSuggestion {
  trigger: string
  contact: {
    name: string
    role: string
    department: string
    email: string
    phone?: string
  }
  template: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reason: string
}

interface EscalationEngineProps {
  message: string
  onSuggestionApply: (suggestion: EscalationSuggestion) => void
}

const EscalationEngine: React.FC<EscalationEngineProps> = ({ message, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState<EscalationSuggestion[]>([])

  useEffect(() => {
    analyzeMsgForEscalation()
  }, [message])

  const analyzeMsgForEscalation = () => {
    const newSuggestions: EscalationSuggestion[] = []

    // Treasury-related keywords
    if (message.toLowerCase().includes('precio') || 
        message.toLowerCase().includes('tasa') || 
        message.toLowerCase().includes('comisión') ||
        message.toLowerCase().includes('tarifa') ||
        message.toLowerCase().includes('saldo') || 
        message.toLowerCase().includes('transferencia') || 
        message.toLowerCase().includes('dinero') ||
        message.toLowerCase().includes('pago')) {
      newSuggestions.push({
        trigger: 'treasury_query',
        contact: {
          name: 'Joel Campos',
          role: 'Head de Tesorería',
          department: 'Tesorería',
          email: 'joel.campos@retorna.app',
          phone: '+57 300 123 4567'
        },
        template: 'Para consultas específicas sobre precios, tasas, comisiones y movimientos financieros, te recomiendo contactar directamente a Joel Campos (joel.campos@retorna.app), nuestro Head de Tesorería. Él puede ayudarte con información sobre tarifas, saldos y conciliaciones bancarias.',
        priority: 'high',
        reason: 'Consulta relacionada con tesorería detectada'
      })
    }

    // Compliance related escalation
    if (message.toLowerCase().includes('compliance') || 
        message.toLowerCase().includes('regulación') || 
        message.toLowerCase().includes('normativa') ||
        message.toLowerCase().includes('aml') ||
        message.toLowerCase().includes('kyc') ||
        message.toLowerCase().includes('lavado de activos')) {
      newSuggestions.push({
        trigger: 'compliance_query',
        contact: {
          name: 'Daniela Zanotti',
          role: 'Head de Compliance',
          department: 'Compliance',
          email: 'daniela.zanotti@retorna.app'
        },
        template: 'Para consultas relacionadas con compliance, regulaciones AML, KYC o normativas financieras, puedes contactar a Daniela Zanotti (daniela.zanotti@retorna.app), nuestra Head de Compliance. Ella puede ayudarte con temas normativos y procedimientos de cumplimiento.',
        priority: 'high',
        reason: 'Consulta relacionada con compliance detectada'
      })
    }

    // Technical issues
    if (message.toLowerCase().includes('técnico') || 
        message.toLowerCase().includes('bug') || 
        message.toLowerCase().includes('sistema') ||
        message.toLowerCase().includes('falla')) {
      newSuggestions.push({
        trigger: 'technical_issue',
        contact: {
          name: 'Carlos Mendez',
          role: 'Tech Lead',
          department: 'Tecnología',
          email: 'carlos@retorna.app'
        },
        template: 'Para problemas técnicos del sistema, te sugiero contactar a Carlos Mendez (carlos@retorna.app), nuestro Tech Lead. Por favor proporciona: ID de transacción (si aplica), descripción detallada del problema y hora aproximada del incidente.',
        priority: 'high',
        reason: 'Problema técnico detectado'
      })
    }

    setSuggestions(newSuggestions)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <MessageSquare className="w-4 h-4" />
      case 'low':
        return <Users className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Sugerencias de Escalación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Badge className={`${getPriorityColor(suggestion.priority)} flex items-center gap-1`}>
                  {getPriorityIcon(suggestion.priority)}
                  {suggestion.priority.toUpperCase()}
                </Badge>
                <span className="text-sm text-purple-600">{suggestion.reason}</span>
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
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {suggestion.template}
              </p>
              
              <Button 
                size="sm" 
                onClick={() => onSuggestionApply(suggestion)}
                className="w-full"
              >
                Aplicar Sugerencia
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default EscalationEngine