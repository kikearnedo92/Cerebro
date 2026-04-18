import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link } from 'react-router-dom'
import {
  Brain, MessageSquare, Database, Users, Shield, Zap, ArrowRight, Check,
  Lock, Plug, Search, Upload, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const LandingPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CEREBRO</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Funciones</a>
            <a href="#integrations" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Integraciones</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full opacity-40 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            Potenciado por Claude AI (Anthropic)
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
            El segundo cerebro{' '}
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text">
              de tu empresa
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Un chat con IA que conoce toda la información de tu empresa. Conecta Notion, Slack, Drive
            y más. Tu equipo pregunta, Cerebro responde con información real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 h-14 shadow-lg shadow-indigo-200">
                Crear mi Cerebro gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                Cómo funciona
              </Button>
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-4">14 días gratis · Sin tarjeta de crédito · Setup en 5 minutos</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 mb-4">Diseñado para equipos que trabajan con conocimiento</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">Fintechs</span>
            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">Startups</span>
            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">Agencias</span>
            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">Customer Success</span>
            <span className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600">Equipos remotos</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tu equipo pierde horas buscando información
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              El conocimiento está disperso en Slack, Notion, Drive, correos y la cabeza de tus empleados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '⏳', title: '30% del tiempo perdido', desc: 'Tu equipo gasta casi un tercio de su día buscando información que ya existe en algún lado.' },
              { emoji: '🚪', title: 'Conocimiento que se va', desc: 'Cuando alguien renuncia, se lleva años de conocimiento crítico que no está documentado.' },
              { emoji: '🐌', title: 'Onboarding lento', desc: 'Los nuevos empleados tardan semanas en ser productivos porque no saben dónde encontrar lo que necesitan.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-red-50/50 border border-red-100">
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Funciona en 3 pasos simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Plug, title: 'Conecta tus herramientas', desc: 'Conecta Notion, Slack, Google Drive, Gmail y más con un click. OAuth seguro, sin compartir contraseñas.' },
              { step: '2', icon: Upload, title: 'Sube tu conocimiento', desc: 'Sube documentos, procesos, políticas. Cerebro los indexa automáticamente con vectores semánticos.' },
              { step: '3', icon: Search, title: 'Tu equipo pregunta', desc: 'Cualquier persona de tu equipo puede hacerle preguntas al chat y obtener respuestas basadas en información real.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                  <item.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Todo lo que tu equipo necesita
            </h2>
            <p className="text-lg text-slate-600">
              Un ChatGPT privado que realmente conoce TU empresa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600', title: 'Chat inteligente con IA', desc: 'Haz preguntas en lenguaje natural y obtén respuestas basadas en documentos y conocimiento real de tu empresa. Powered by Claude AI.' },
              { icon: Database, color: 'bg-violet-50 text-violet-600', title: 'Base de conocimiento', desc: 'Sube documentos, procesos, políticas y cualquier contenido. Cerebro lo indexa con vectores semánticos para búsqueda inteligente.' },
              { icon: Plug, color: 'bg-emerald-50 text-emerald-600', title: 'Integraciones nativas', desc: 'Conecta Notion, Slack, Google Drive, Gmail y Calendar. Cerebro busca en todas tus herramientas al mismo tiempo.' },
              { icon: Users, color: 'bg-amber-50 text-amber-600', title: 'Multi-usuario', desc: 'Invita a todo tu equipo. Paga por empresa, no por usuario. Onboarding en días, no semanas.' },
              { icon: Lock, color: 'bg-red-50 text-red-600', title: 'Privado y seguro', desc: 'Cada empresa tiene su espacio aislado. Datos encriptados, multi-tenant con Row Level Security.' },
              { icon: Zap, color: 'bg-cyan-50 text-cyan-600', title: 'Escalación inteligente', desc: 'Detecta automáticamente cuando una consulta necesita atención humana y sugiere a quién escalar.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Conecta las herramientas que ya usas
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Un click para conectar. Cerebro sincroniza e indexa automáticamente.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { name: 'Notion', icon: '📝', color: 'bg-gray-900' },
              { name: 'Slack', icon: '💬', color: 'bg-purple-600' },
              { name: 'Google Drive', icon: '📁', color: 'bg-green-600' },
              { name: 'Gmail', icon: '✉️', color: 'bg-red-500' },
              { name: 'Calendar', icon: '📅', color: 'bg-blue-500' },
            ].map((tool) => (
              <div key={tool.name} className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center text-xl`}>
                  {tool.icon}
                </div>
                <span className="font-medium text-slate-900">{tool.name}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['HubSpot', 'Intercom', 'Jira', 'Confluence', 'Zendesk', 'Salesforce', 'Linear', 'GitHub'].map((name) => (
              <span key={name} className="px-4 py-2 bg-white/70 text-slate-400 rounded-lg text-sm border border-slate-100">
                {name} (pronto)
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Precios simples, sin sorpresas
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Paga por empresa, no por usuario. Que todos en tu equipo lo usen.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-left hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-1">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">$49</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Hasta 10 usuarios</p>
              <Link to="/auth?mode=signup">
                <Button variant="outline" className="w-full mb-6">Empezar gratis</Button>
              </Link>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> 1,000 consultas/mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> 100MB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Chat con IA (Claude)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Base de conocimiento</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> 2 integraciones</li>
              </ul>
            </div>

            {/* Growth */}
            <div className="bg-indigo-600 p-8 rounded-2xl text-left relative shadow-xl shadow-indigo-200">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="font-semibold text-white mb-1">Growth</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-indigo-200">/mes</span>
              </div>
              <p className="text-sm text-indigo-200 mb-6">Hasta 30 usuarios</p>
              <Link to="/auth?mode=signup">
                <Button className="w-full mb-6 bg-white text-indigo-700 hover:bg-indigo-50">Empezar gratis</Button>
              </Link>
              <ul className="space-y-3 text-sm text-indigo-100">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300 flex-shrink-0" /> 5,000 consultas/mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300 flex-shrink-0" /> 500MB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300 flex-shrink-0" /> Todo en Starter</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300 flex-shrink-0" /> Todas las integraciones</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300 flex-shrink-0" /> Escalación inteligente</li>
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-left hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-1">Business</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">$199</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Hasta 100 usuarios</p>
              <Link to="/auth?mode=signup">
                <Button variant="outline" className="w-full mb-6">Empezar gratis</Button>
              </Link>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Consultas ilimitadas</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> 2GB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Todo en Growth</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> API access</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Soporte prioritario</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dale un cerebro a tu empresa hoy
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            En 5 minutos tienes tu Cerebro funcionando. Sube tus primeros documentos y empieza a consultar.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 text-lg px-8 h-14 shadow-lg">
              Crear mi Cerebro ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CEREBRO</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link to="/pricing" className="hover:text-white transition-colors">Precios</Link>
              <a href="mailto:hola@usacerebro.com" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 Cerebro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
