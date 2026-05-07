import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, X, Plug, MessageSquare, Users } from 'lucide-react'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useAuth } from '@/hooks/useAuth'

const DISMISSED_KEY = 'cerebro_onboarding_dismissed'

const OnboardingChecklist = () => {
  const { connections, loading } = useIntegrations()
  const { profile } = useAuth()
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const stepsState = useMemo(() => {
    const hasConnection = connections.some(c => c.status === 'connected')
    const hasItemsSynced = connections.some(c => (c.items_synced || 0) > 0)
    const hasCompany = !!profile?.company_name

    return {
      profile: hasCompany,
      connect: hasConnection,
      sync: hasItemsSynced,
    }
  }, [connections, profile])

  const allDone = stepsState.profile && stepsState.connect && stepsState.sync
  const hideBanner = dismissed || allDone || loading

  if (hideBanner) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {}
  }

  const steps = [
    {
      id: 'profile',
      title: 'Completa tu perfil',
      description: 'Pon el nombre de tu empresa para personalizar Cerebro.',
      done: stepsState.profile,
      icon: <Users className="w-4 h-4" />,
      action: { label: 'Ir a perfil', to: '/app/profile' },
    },
    {
      id: 'connect',
      title: 'Conecta una fuente',
      description: 'Notion o Google Drive. Sin esto, Cerebro responde con conocimiento general.',
      done: stepsState.connect,
      icon: <Plug className="w-4 h-4" />,
      action: { label: 'Ir a integraciones', to: '/app/integrations' },
    },
    {
      id: 'sync',
      title: 'Sincroniza y haz tu primera pregunta',
      description: 'Cuando termine el sync, prueba el chat con info real de tu empresa.',
      done: stepsState.sync,
      icon: <MessageSquare className="w-4 h-4" />,
      action: { label: 'Ir al chat', to: '/app/chat' },
    },
  ]

  const completed = steps.filter(s => s.done).length
  const total = steps.length

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 relative overflow-hidden">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        aria-label="Cerrar onboarding"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Bienvenido a Cerebro
        </h2>
        <span className="text-xs text-slate-400">
          {completed} de {total} listos
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-5">
        Configura tu workspace en 3 pasos para que Cerebro responda con información real de tu empresa.
      </p>

      <div className="space-y-3">
        {steps.map(step => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.done ? 'bg-slate-800/50' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? 'text-slate-400 line-through' : 'text-white'}`}>
                {step.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
            </div>
            {!step.done && (
              <Link
                to={step.action.to}
                className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline flex-shrink-0 mt-1"
              >
                {step.action.label} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OnboardingChecklist
