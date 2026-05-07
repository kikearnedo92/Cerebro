import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
]

const USE_CASES = [
  'Onboarding y reducción de tickets repetidos',
  'Capa de contexto para agentes IA / automatizaciones',
  'Buscador interno (Notion, Drive, Slack, Gmail)',
  'Atención al cliente / soporte interno',
  'Documentación viva de procesos',
  'Otro',
]

const WaitlistPage = () => {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [useCase, setUseCase] = useState('')
  const [referrer, setReferrer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !companySize || !useCase) {
      setError('Por favor completa los campos obligatorios')
      return
    }
    setSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('waitlist').insert({
        email: email.trim().toLowerCase(),
        company_name: companyName.trim() || null,
        company_size: companySize,
        use_case: useCase,
        referrer: referrer || (typeof document !== 'undefined' ? document.referrer : null),
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      })
      if (insertError) {
        // Duplicate email is OK — show as success
        if (insertError.code === '23505') {
          setSubmitted(true)
          return
        }
        throw insertError
      }
      setSubmitted(true)
    } catch (err: any) {
      console.error('Waitlist error:', err)
      setError(err.message || 'Hubo un error. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Estás en la lista</h1>
          <p className="text-slate-300 text-lg mb-8">
            Te avisaremos en cuanto abramos un cupo. Mientras tanto, si quieres acelerar
            tu acceso, escríbenos a{' '}
            <a href="mailto:hola@cerebro.app" className="text-indigo-400 underline">
              hola@cerebro.app
            </a>{' '}
            con tu caso de uso.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Cerebro</span>
          </Link>
          <Link to="/" className="text-sm text-slate-400 hover:text-white">
            ← Inicio
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6 text-indigo-300 text-sm">
            <Sparkles className="w-4 h-4" />
            Acceso anticipado limitado
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            La capa de contexto para tu equipo y tus agentes IA
          </h1>
          <p className="text-slate-300 text-lg">
            Cerebro indexa tu conocimiento (Notion, Drive, Slack, Gmail) y lo deja
            disponible para personas y para agentes vía MCP. Sin migrar nada.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">
              Email de trabajo *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">
              Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">
              Tamaño del equipo *
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {COMPANY_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCompanySize(s)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    companySize === s
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">
              ¿Para qué lo necesitas? *
            </label>
            <div className="space-y-2">
              {USE_CASES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUseCase(u)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    useCase === u
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">
              ¿Cómo nos encontraste? <span className="text-slate-500">(opcional)</span>
            </label>
            <input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="LinkedIn, recomendación, búsqueda..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Enviando...' : 'Quiero acceso anticipado'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Sin spam. Solo te escribimos cuando abrimos tu cupo.
          </p>
        </form>
      </main>
    </div>
  )
}

export default WaitlistPage
