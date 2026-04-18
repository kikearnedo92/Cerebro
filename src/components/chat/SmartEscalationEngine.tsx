import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowUpRight, X } from 'lucide-react'

interface EscalationRule {
  keywords: string[]
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  suggestion: string
}

interface SmartEscalationEngineProps {
  message: string
  onEscalate?: (category: string, priority: string) => void
}

// Configurable escalation rules (can be customized per tenant)
const DEFAULT_RULES: EscalationRule[] = [
  {
    keywords: ['urgente', 'critico', 'emergencia', 'caido', 'no funciona'],
    category: 'Soporte Técnico',
    priority: 'urgent',
    suggestion: 'Este mensaje indica una urgencia. Considera escalar inmediatamente al equipo técnico.',
  },
  {
    keywords: ['precio', 'tarifa', 'cobro', 'factura', 'pago', 'reembolso'],
    category: 'Finanzas',
    priority: 'high',
    suggestion: 'Consulta financiera detectada. El equipo de finanzas puede dar información más precisa.',
  },
  {
    keywords: ['legal', 'contrato', 'demanda', 'regulación', 'compliance'],
    category: 'Legal',
    priority: 'medium',
    suggestion: 'Tema legal o regulatorio detectado. Escala al equipo de compliance.',
  },
  {
    keywords: ['queja', 'reclamo', 'insatisfecho', 'mal servicio', 'cancelar'],
    category: 'Retención',
    priority: 'high',
    suggestion: 'Cliente insatisfecho. Considera escalar a un supervisor o al equipo de retención.',
  },
]

const SmartEscalationEngine: React.FC<SmartEscalationEngineProps> = ({ message, onEscalate }) => {
  const [matchedRules, setMatchedRules] = useState<EscalationRule[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!message || message.length < 10) {
      setMatchedRules([])
      return
    }

    const lowerMsg = message.toLowerCase()
    const matches = DEFAULT_RULES.filter(rule =>
      rule.keywords.some(keyword => lowerMsg.includes(keyword))
    )

    setMatchedRules(matches)
    setDismissed(false)
  }, [message])

  if (matchedRules.length === 0 || dismissed) return null

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          Escalación inteligente
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {matchedRules.map((rule, idx) => (
          <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-white/70">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[rule.priority]}>{rule.category}</Badge>
                <span className="text-xs text-slate-500">Prioridad: {rule.priority}</span>
              </div>
              <p className="text-sm text-slate-600">{rule.suggestion}</p>
            </div>
            {onEscalate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEscalate(rule.category, rule.priority)}
                className="flex-shrink-0"
              >
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Escalar
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SmartEscalationEngine
