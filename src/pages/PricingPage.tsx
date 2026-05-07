import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Check, ArrowRight, ArrowLeft, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 29,
    pricePer: 'mes',
    description: 'Para fundadores y equipos chicos validando',
    users: 'Hasta 5 usuarios',
    queries: '500 consultas/mes incluidas',
    overage: '$0.05 por consulta extra',
    features: [
      '3 conectores (Notion, Drive, Slack...)',
      'Chat con IA (Claude Sonnet)',
      'Búsqueda en base de conocimiento',
      '1 API key (MCP server)',
      'Soporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 99,
    pricePer: 'mes',
    description: 'Para equipos en crecimiento que ya operan',
    users: 'Hasta 20 usuarios',
    queries: '3,000 consultas/mes incluidas',
    overage: '$0.04 por consulta extra',
    features: [
      'Conectores ilimitados',
      'Chat con IA + RAG completo',
      'Daily Standup Agent',
      '5 API keys (MCP server)',
      'Webhooks + integraciones API',
      'Analytics de uso por agente',
      'Soporte prioritario',
    ],
    highlighted: true,
  },
  {
    name: 'Team',
    price: 299,
    pricePer: 'mes',
    description: 'Para empresas mid-market 50-200 personas',
    users: 'Hasta 100 usuarios',
    queries: '15,000 consultas/mes incluidas',
    overage: '$0.03 por consulta extra',
    features: [
      'Todo en Pro',
      'API keys ilimitadas',
      'Rate limiting custom',
      'SSO / SAML',
      'Aislamiento por workspace',
      'Account manager dedicado',
      'SLA de respuesta 4h',
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
            <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CEREBRO</span>
          </Link>
          <Link to="/waitlist">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
              Acceso anticipado
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-5 text-indigo-700 text-sm">
          <Zap className="w-4 h-4" />
          Suscripción + transaccional · Nunca te sorprende la factura
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Pricing simple. Pagas por valor, no por seat.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Una base mensual con consultas incluidas + costo transaccional cuando excedes
          tu cupo. Más barato que Glean, Notion AI o Microsoft Copilot, sin contratos
          anuales.
        </p>
      </section>

      {/* Plans */}
      <section className="pb-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-7 rounded-2xl text-left relative ${
                plan.highlighted
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 ring-2 ring-indigo-500'
                  : 'bg-white border border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  MÁS ELEGIDO
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${plan.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  ${plan.price}
                </span>
                <span className={plan.highlighted ? 'text-slate-400' : 'text-slate-500'}>
                  /{plan.pricePer}
                </span>
              </div>
              <p className={`text-sm mb-1 ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>
                {plan.users}
              </p>
              <div className={`mt-4 mb-5 p-3 rounded-lg ${
                plan.highlighted ? 'bg-slate-800' : 'bg-slate-50'
              }`}>
                <p className={`text-xs font-medium mb-1 ${plan.highlighted ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  INCLUIDO
                </p>
                <p className={`text-sm font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.queries}
                </p>
                <p className={`text-xs mt-1 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  Después: {plan.overage}
                </p>
              </div>
              <Link to="/waitlist">
                <Button
                  className={`w-full mb-5 ${
                    plan.highlighted
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Acceso anticipado
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2 text-sm ${
                      plan.highlighted ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparativa quick-row */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">¿Por qué somos más baratos?</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">
            Cobramos por workspace, no por seat. Sumas más usuarios sin que crezca la factura.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Plataforma</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Modelo</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Costo equipo de 20</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-indigo-50/50">
                  <td className="p-4 font-semibold text-indigo-900">Cerebro Pro</td>
                  <td className="p-4 text-slate-600">$99/workspace + overage</td>
                  <td className="p-4 font-bold text-indigo-900">$99/mes</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">Glean</td>
                  <td className="p-4 text-slate-600">$50/seat (anual, mínimo 100)</td>
                  <td className="p-4 text-slate-700">$1,000/mes ❌ no acepta &lt;100 seats</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">Notion AI</td>
                  <td className="p-4 text-slate-600">$20/seat (mensual)</td>
                  <td className="p-4 text-slate-700">$400/mes</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">Microsoft Copilot</td>
                  <td className="p-4 text-slate-600">$30/seat (anual)</td>
                  <td className="p-4 text-slate-700">$600/mes</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-700">ChatGPT Team</td>
                  <td className="p-4 text-slate-600">$25/seat (anual)</td>
                  <td className="p-4 text-slate-700">$500/mes (sin RAG empresarial)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">
            Precios públicos a 2026-05. El costo equivalente con Cerebro Pro escala 0% al sumar usuarios hasta 20.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Preguntas frecuentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                ¿Qué cuenta como una "consulta"?
              </h3>
              <p className="text-slate-600 text-sm">
                Cada pregunta enviada al chat o cada llamada de un agente externo vía MCP cuenta
                como 1 consulta. Las búsquedas internas y la sincronización de fuentes son gratis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Cómo funciona el cobro transaccional?</h3>
              <p className="text-slate-600 text-sm">
                Pagas tu plan mensual fijo (Starter/Pro/Team). Si excedes el cupo de consultas
                incluidas, cada consulta extra se cobra al cierre del ciclo al precio del plan.
                Te avisamos al 80% y al 100% para que tengas control.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Puedo poner un tope de gasto?</h3>
              <p className="text-slate-600 text-sm">
                Sí. Puedes configurar un cap mensual (ej: máximo $200) y cuando se alcance, el
                workspace pausa nuevas consultas hasta el siguiente ciclo o hasta que aumentes el cap.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Hay descuento por pago anual?</h3>
              <p className="text-slate-600 text-sm">
                Sí — 2 meses gratis al pagar el año (≈17% off). Disponible en todos los planes
                a partir del lanzamiento público.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Mis datos están seguros?</h3>
              <p className="text-slate-600 text-sm">
                Cada empresa tiene su workspace completamente aislado vía RLS de Postgres. Los
                tokens OAuth se cifran AES-256-GCM. Nunca usamos tu contenido para entrenar modelos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Qué métodos de pago aceptan?</h3>
              <p className="text-slate-600 text-sm">
                Tarjetas de crédito/débito vía Stripe. Para Team también aceptamos transferencia y
                facturación electrónica en Chile, Colombia, Perú y México.
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
