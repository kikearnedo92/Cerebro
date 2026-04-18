import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link } from 'react-router-dom'
import { Brain, MessageSquare, Database, Users, Shield, Zap, ArrowRight, Check, Globe, Lock } from 'lucide-react'
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
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:block">
              Precios
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Iniciar sesi&oacute;n</Button>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            Potenciado por Claude AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            El segundo cerebro{' '}
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text">
              de tu empresa
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Un chat con IA que conoce toda la informaci&oacute;n de tu empresa. Documentos, procesos,
            historia, contactos &mdash; todo en un solo lugar. Tu equipo pregunta, Cerebro responde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 h-12">
                Crear mi Cerebro gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                Ver demo
              </Button>
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-4">14 d&iacute;as gratis. Sin tarjeta de cr&eacute;dito.</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 mb-6">Creado por l&iacute;deres de operaciones que entienden el problema</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="text-lg font-semibold text-slate-400">Fintechs</span>
            <span className="text-lg font-semibold text-slate-400">Startups</span>
            <span className="text-lg font-semibold text-slate-400">PYMEs</span>
            <span className="text-lg font-semibold text-slate-400">Equipos remotos</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              &iquest;Tu equipo pierde tiempo buscando informaci&oacute;n?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              El conocimiento de tu empresa est&aacute; disperso en Slack, Notion, Google Drive, correos y la cabeza de tus empleados.
              Cuando alguien nuevo entra, tarda semanas en entender c&oacute;mo funciona todo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">&#x23F3;</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Horas perdidas</h3>
              <p className="text-slate-600 text-sm">
                Tu equipo gasta 20% de su tiempo buscando informaci&oacute;n que ya existe en alg&uacute;n lado.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">&#x1F6AA;</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Conocimiento que se va</h3>
              <p className="text-slate-600 text-sm">
                Cuando alguien renuncia, se lleva a&ntilde;os de conocimiento cr&iacute;tico de la empresa.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">&#x1F635;</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Onboarding lento</h3>
              <p className="text-slate-600 text-sm">
                Los nuevos empleados tardan semanas en ser productivos porque no encuentran lo que necesitan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution / Features */}
      <section id="demo" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Cerebro centraliza todo el conocimiento de tu empresa
            </h2>
            <p className="text-lg text-slate-600">
              Un ChatGPT privado que realmente conoce TU empresa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Chat inteligente</h3>
              <p className="text-slate-600">
                Haz preguntas en lenguaje natural y obt&eacute;n respuestas basadas en los documentos y conocimiento real de tu empresa.
                No respuestas gen&eacute;ricas, sino informaci&oacute;n espec&iacute;fica tuya.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Base de conocimiento</h3>
              <p className="text-slate-600">
                Sube documentos, procesos, pol&iacute;ticas, research y cualquier contenido.
                Cerebro lo indexa y lo tiene listo para consultar al instante.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Para todo el equipo</h3>
              <p className="text-slate-600">
                Invita a tu equipo y todos tienen acceso al mismo conocimiento.
                Onboarding en d&iacute;as, no semanas. Cada persona encuentra lo que necesita.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Privado y seguro</h3>
              <p className="text-slate-600">
                Tu informaci&oacute;n es solo tuya. Cada empresa tiene su espacio aislado.
                Datos encriptados y sin acceso de terceros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Precios simples, sin sorpresas
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Paga por empresa, no por usuario. Que todos en tu equipo lo usen.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-left">
              <h3 className="font-semibold text-slate-900 mb-1">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-slate-900">$49</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Hasta 10 usuarios</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> 1,000 consultas/mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> 100MB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Chat con IA</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Knowledge Base</li>
              </ul>
            </div>

            {/* Growth */}
            <div className="bg-indigo-600 p-8 rounded-2xl text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="font-semibold text-white mb-1">Growth</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">$99</span>
                <span className="text-indigo-200">/mes</span>
              </div>
              <p className="text-sm text-indigo-200 mb-6">Hasta 30 usuarios</p>
              <ul className="space-y-3 text-sm text-indigo-100">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300" /> 5,000 consultas/mes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300" /> 500MB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300" /> Todo en Starter</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-300" /> Conectores (pronto)</li>
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-left">
              <h3 className="font-semibold text-slate-900 mb-1">Business</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-slate-900">$199</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Hasta 100 usuarios</p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Consultas ilimitadas</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> 2GB documentos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Todo en Growth</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Soporte prioritario</li>
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 h-12">
                Empezar 14 d&iacute;as gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            &iquest;Listo para darle un cerebro a tu empresa?
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            En 5 minutos tienes tu Cerebro funcionando. Sube tus primeros documentos y empieza a consultar.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 text-lg px-8 h-12">
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
              <Link to="/pricing" className="hover:text-white">Precios</Link>
              <a href="mailto:hola@usacerebro.com" className="hover:text-white">Contacto</a>
            </div>
            <p className="text-sm text-slate-500">
              &copy; 2026 Cerebro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
