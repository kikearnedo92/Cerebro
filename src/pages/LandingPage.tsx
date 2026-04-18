import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link } from 'react-router-dom'
import {
  Brain, MessageSquare, Database, Users, Zap, ArrowRight, Check,
  Lock, Plug, Search, Upload, ChevronRight, Star, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Inline SVG logos for integrations (no emojis)
const NotionLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.297 2.13c-.466-.373-.84-.186-1.587.093L4.506 3.463c-.466.186-.56.56-.047.745zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.84c-.56.047-.747.327-.747.98zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.493-.933l-4.577-7.186v6.952l1.447.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.214-.14c-.094-.514.28-.886.746-.933zM2.332 1.85l13.028-.84c1.587-.14 1.96-.046 2.985.653l4.11 2.89c.654.466.84.56.84 1.12v16.56c0 1.027-.374 1.634-1.68 1.727l-15.458.933c-.98.047-1.447-.093-1.96-.747l-3.13-4.064c-.56-.747-.793-1.307-.793-1.96V3.62c0-.84.374-1.54 1.026-1.773z"/>
  </svg>
)
const SlackLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
)
const DriveLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M7.71 3.5L1.15 15l3.43 5.98 6.56-11.48L7.71 3.5zm1.14 0l6.56 11.48H24L17.44 3.5H8.85zM0 16.14l3.43 5.98h13.72l3.43-5.98H0z"/>
  </svg>
)

const LandingPage = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 tracking-tight">cerebro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Producto</a>
            <a href="#integrations" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Integraciones</a>
            <a href="#pricing" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-[13px] text-slate-600 h-8">Ingresar</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-[13px] h-8 rounded-lg">
                Probar gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric with product mockup */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-[13px] font-medium text-indigo-600 mb-4 tracking-wide uppercase">Powered by Claude AI</p>
            <h1 className="text-4xl md:text-[56px] font-semibold text-slate-900 leading-[1.1] mb-5 tracking-tight">
              El segundo cerebro<br />de tu empresa
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              Un chat con IA que conecta Notion, Slack y Drive. Tu equipo pregunta, Cerebro responde con la información real de tu empresa.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <Link to="/auth?mode=signup">
                <Button className="bg-slate-900 hover:bg-slate-800 h-11 px-6 rounded-lg text-sm">
                  Empezar gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="ghost" className="h-11 px-6 text-sm text-slate-500">
                  Ver cómo funciona
                </Button>
              </a>
            </div>
            <p className="text-xs text-slate-400">14 días gratis. Sin tarjeta de crédito.</p>
          </div>

          {/* Product mockup */}
          <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-white border-b border-slate-100">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <span className="ml-3 text-[11px] text-slate-400">cerebro-ivory.vercel.app/app/chat</span>
            </div>
            <div className="flex h-[340px]">
              {/* Sidebar mockup */}
              <div className="w-56 bg-white border-r border-slate-100 p-4 hidden md:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">CEREBRO</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-indigo-50 rounded text-xs font-medium text-indigo-700">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400">
                    <Database className="w-3.5 h-3.5" /> Conocimiento
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400">
                    <Plug className="w-3.5 h-3.5" /> Integraciones
                  </div>
                </div>
              </div>
              {/* Chat mockup */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-slate-900 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-xs">
                      ¿Cuál es la política de devoluciones para clientes en Chile?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-sm leading-relaxed">
                      Según el <span className="text-indigo-600 font-medium">Manual de Operaciones v3.2</span>, la política para Chile establece un plazo de 30 días hábiles para solicitar devolución...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-300 flex-1">Pregunta algo sobre tu empresa...</span>
                  <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / trust — minimal */}
      <section className="py-8 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-8 opacity-40">
          <span className="text-sm font-medium text-slate-900">Notion</span>
          <span className="text-sm font-medium text-slate-900">Slack</span>
          <span className="text-sm font-medium text-slate-900">Google Drive</span>
          <span className="text-sm font-medium text-slate-900">Gmail</span>
          <span className="text-sm font-medium text-slate-900">Calendar</span>
        </div>
      </section>

      {/* Problem — left-aligned, editorial */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[13px] font-medium text-red-500 mb-3 tracking-wide uppercase">El problema</p>
              <h2 className="text-3xl font-semibold text-slate-900 leading-snug mb-4 tracking-tight">
                Tu equipo pierde horas buscando información que ya existe
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                El conocimiento de tu empresa vive en 5 herramientas distintas, 200 documentos y la cabeza de 3 personas. Cuando alguien renuncia, se va todo con ellos.
              </p>
              <div className="space-y-3">
                {[
                  '30% del tiempo se gasta buscando información',
                  'Onboarding de nuevos empleados toma semanas',
                  'Conocimiento crítico no está documentado',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-500 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 text-slate-400">
                  <Search className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Buscando en Slack... 0 resultados</span>
                </div>
                <div className="flex items-start gap-3 text-slate-400">
                  <Search className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Buscando en Drive... 47 resultados (ninguno relevante)</span>
                </div>
                <div className="flex items-start gap-3 text-slate-400">
                  <Search className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Preguntando a María... (está de vacaciones)</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex items-start gap-3 text-slate-400">
                  <span className="text-2xl leading-none">😩</span>
                  <span>45 minutos después, sin respuesta.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — horizontal steps */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] font-medium text-indigo-600 mb-3 tracking-wide uppercase">Cómo funciona</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-12 tracking-tight">
            Tres pasos. Cinco minutos.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', icon: Plug, title: 'Conecta', desc: 'Conecta Notion, Slack, Google Drive con OAuth. Un click, sin contraseñas. Tu data se indexa automáticamente.' },
              { num: '02', icon: Upload, title: 'Alimenta', desc: 'Sube documentos, manuales, procesos. Cerebro los vectoriza y los hace buscables por cualquiera del equipo.' },
              { num: '03', icon: MessageSquare, title: 'Pregunta', desc: 'Tu equipo abre el chat y pregunta. Cerebro responde con fuentes, citas y contexto real de tu empresa.' },
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
                <span className="text-[11px] font-mono text-slate-300 block mb-4">{step.num}</span>
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — asymmetric grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] font-medium text-indigo-600 mb-3 tracking-wide uppercase">Funcionalidades</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
            Todo lo que tu equipo necesita
          </h2>
          <p className="text-slate-500 mb-12 max-w-lg">Un ChatGPT privado que realmente conoce tu empresa. No respuestas genéricas — información tuya.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-xl text-white">
              <MessageSquare className="w-8 h-8 mb-4 text-indigo-400" />
              <h3 className="text-xl font-semibold mb-2">Chat inteligente con Claude AI</h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Preguntas en lenguaje natural, respuestas con fuentes citadas. Tu equipo obtiene la información que necesita en segundos, no en horas.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <Database className="w-6 h-6 text-slate-900 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">Base de conocimiento</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Indexación semántica de documentos, procesos y políticas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <Plug className="w-6 h-6 text-slate-900 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">5 integraciones</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Notion, Slack, Drive, Gmail y Calendar conectados con un click.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <Users className="w-6 h-6 text-slate-900 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">Multi-usuario</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Paga por empresa, no por persona. Todo el equipo tiene acceso.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <Lock className="w-6 h-6 text-slate-900 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">Privado y seguro</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Multi-tenant con Row Level Security. Tu data nunca se cruza con otros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[13px] font-medium text-indigo-600 mb-3 tracking-wide uppercase">Integraciones</p>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
                Se conecta donde tu equipo ya trabaja
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                OAuth seguro. Un click para conectar. Cerebro sincroniza e indexa automáticamente. Tu equipo no tiene que cambiar nada.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Notion', desc: 'Páginas, databases y wikis', Logo: NotionLogo },
                  { name: 'Slack', desc: 'Conversaciones y decisiones', Logo: SlackLogo },
                  { name: 'Google Drive', desc: 'Docs, Sheets y Slides', Logo: DriveLogo },
                ].map((tool, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700">
                      <tool.Logo />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                      <p className="text-xs text-slate-400">{tool.desc}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex flex-wrap gap-2 justify-center">
                {['Gmail', 'Calendar', 'HubSpot', 'Intercom', 'Jira', 'Zendesk', 'Salesforce', 'Linear'].map((name, i) => (
                  <span key={name} className={`px-3 py-1.5 rounded-md text-xs font-medium ${i < 2 ? 'bg-white border border-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
                    {name} {i >= 2 && <span className="text-slate-300">·</span>} {i >= 2 && <span className="text-[10px]">pronto</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[13px] font-medium text-indigo-600 mb-3 tracking-wide uppercase">Precios</p>
            <h2 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
              Simple. Por empresa, no por usuario.
            </h2>
            <p className="text-slate-500">Que todos en tu equipo lo usen sin preocuparse por costos extras.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { name: 'Starter', price: '49', users: '10 usuarios', features: ['1,000 consultas/mes', '100MB documentos', 'Chat con IA (Claude)', 'Base de conocimiento', '2 integraciones'], highlight: false },
              { name: 'Growth', price: '99', users: '30 usuarios', features: ['5,000 consultas/mes', '500MB documentos', 'Todo en Starter', 'Todas las integraciones', 'Escalación inteligente'], highlight: true },
              { name: 'Business', price: '199', users: '100 usuarios', features: ['Consultas ilimitadas', '2GB documentos', 'Todo en Growth', 'API access', 'Soporte prioritario'], highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`p-6 rounded-xl text-left ${plan.highlight ? 'bg-slate-900 text-white ring-2 ring-slate-900' : 'bg-white border border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-semibold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  {plan.highlight && <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded">POPULAR</span>}
                </div>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/mes</span>
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>Hasta {plan.users}</p>
                <Link to="/auth?mode=signup">
                  <Button className={`w-full mb-5 h-9 text-sm rounded-lg ${plan.highlight ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    Empezar gratis
                  </Button>
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-xs ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-slate-300'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight">
            Dale un cerebro a tu empresa
          </h2>
          <p className="text-slate-400 mb-6">
            Setup en 5 minutos. 14 días gratis. Sin tarjeta de crédito.
          </p>
          <Link to="/auth?mode=signup">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 h-11 px-6 rounded-lg text-sm">
              Crear mi Cerebro
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">cerebro</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-400">
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Precios</Link>
            <a href="mailto:hola@usacerebro.com" className="hover:text-slate-900 transition-colors">Contacto</a>
          </div>
          <p className="text-xs text-slate-400">© 2026 Cerebro</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
