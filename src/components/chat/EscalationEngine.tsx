import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Mail, MessageSquare } from 'lucide-react'

interface EscalationSuggestion {
  trigger: string
  category: string
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
    const lowerMsg = message.toLowerCase()

    // Financial queries
    if (['precio', 'tasa', 'comisión', 'tarifa', 'pago', 'factura', 'cobro'].some(k => lowerMsg.includes(k))) {
      newSuggestions.push({
        trigger: 'financial_query',
        category: 'Finanzas',
        template: 'Para consultas sobre precios, tarifas y facturación, te recomiendo contactar al equipo de finanzas de tu empresa.',
        priority: 'high',
        reason: 'Consulta financiera detectada',
      })
    }

    // Technical issues
    if (['error', 'bug', 'no funciona', 'problema técnico', 'caída', 'falla'].some(k => lowerMsg.includes(k))) {
      newSuggestions.push({
        trigger: 'tech_issue',
        category: 'Soporte Técnico',
        template: 'Este parece ser un problema técnico. Te sugiero escalar al equipo de ingeniería con los detalles del error.',
        priority: 'urgent',
        reason: 'Problema técnico detectado',
      })
    }

    // Compliance/legal
    if (['legal', 'compliance', 'regulación', 'normativa', 'contrato'].some(k => lowerMsg.includes(k))) {
      newSuggestions.push({
        trigger: 'compliance_query',
        category: 'Legal / Compliance',
        template: 'Para temas legales o de cumplimiento normativo, contacta al equipo de compliance de tu empresa.',
        priority: 'medium',
        reason: 'Consulta de compliance detectada',
      })
    }

    setSuggestions(newSuggestions)
  }

  if (suggestions.length === 0) return null

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          Sugerencia de escalación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[suggestion.priority]}>{suggestion.priority}</Badge>
              <span className="text-xs text-slate-600">{suggestion.reason}</span>
            </div>
            <p className="text-sm text-slate-700">{suggestion.template}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSuggestionApply(suggestion)}
              className="text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Usar sugerencia
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default EscalationEngine
