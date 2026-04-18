import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Para startups y equipos pequenos',
    users: 'Hasta 10 usuarios',
    features: [
      '1,000 consultas al mes',
      '100MB de documentos',
      'Chat con IA (Claude)',
      'Base de conocimiento',
      'Gestion de usuarios',
      'Soporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 99,
    description: 'Para PYMEs en crecimiento',
    users: 'Hasta 30 usuarios',
    features: [
      '5,000 consultas al mes',
      '500MB de documentos',
      'Todo en Starter',
      'Conectores (Slack, Notion, Drive)',
      'Analytics de uso',
      'Soporte prioritario',
    ],
    highlighted: true,
  },
  {
    name: 'Business',
    price: 199,
    description: 'Para empresas medianas',
    users: 'Hasta 100 usuarios',
    features: [
      'Consultas ilimitadas',
      '2GB de documentos',
      'Todo en Growth',
      'API access',
      'SSO / SAML',
      'Account manager dedicado',
    ],
    highlighted: false,
  },
]

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CEREBRO</span>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Empezar gratis
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Precios simples, valor real
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Paga por empresa, no por usuario. Todos en tu equipo tienen acceso.
          14 dias de prueba gratis en cualquier plan.
        </p>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl text-left ${
                plan.highlighted
                  ? 'bg-indigo-600 text-white relative'
                  : 'bg-white border border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className={`font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-indigo-200' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  ${plan.price}
                </span>
                <span className={plan.highlighted ? 'text-indigo-200' : 'text-slate-500'}>/mes</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-200' : 'text-slate-500'}`}>
                {plan.users}
              </p>
              <Link to="/auth?mode=signup">
                <Button
                  className={`w-full mb-6 ${
                    plan.highlighted
                      ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Empezar gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-center gap-2 text-sm ${
                      plan.highlighted ? 'text-indigo-100' : 'text-slate-600'
                    }`}
                  >
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-indigo-300' : 'text-indigo-600'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Preguntas frecuentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Que pasa despues de los 14 dias gratis?</h3>
              <p className="text-slate-600 text-sm">
                Si te gusta, eliges un plan y pagas. Si no, tu cuenta se pausa sin perder datos. Sin compromisos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Puedo cambiar de plan despues?</h3>
              <p className="text-slate-600 text-sm">
                Si, puedes subir o bajar de plan en cualquier momento. El cambio aplica en tu proximo ciclo de facturacion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Mis datos estan seguros?</h3>
              <p className="text-slate-600 text-sm">
                Cada empresa tiene su espacio completamente aislado. Tus datos estan encriptados y nunca se usan para entrenar modelos de IA.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Que metodos de pago aceptan?</h3>
              <p className="text-slate-600 text-sm">
                Aceptamos tarjetas de credito y debito a traves de Stripe. Facturacion mensual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to home */}
      <div className="py-8 px-6 text-center">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default PricingPage
