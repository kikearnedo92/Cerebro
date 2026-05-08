import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

const SUBPROCESSORS = [
  {
    name: 'Supabase',
    purpose: 'Auth, Postgres DB, Storage, Edge Functions',
    location: 'AWS us-east-2 (Estados Unidos)',
    dataShared: 'Todo el contenido del workspace cifrado en reposo',
    website: 'https://supabase.com',
    dpa: 'https://supabase.com/legal/dpa',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting frontend y serverless functions',
    location: 'Edge global (con presencia primaria USA)',
    dataShared: 'Requests HTTP, IP, user-agent. NO compartido para training (opt-out aplicado).',
    website: 'https://vercel.com',
    dpa: 'https://vercel.com/legal/dpa',
  },
  {
    name: 'Anthropic',
    purpose: 'Procesamiento de queries (Claude LLM)',
    location: 'Estados Unidos',
    dataShared: 'Texto del query + contexto recuperado. API comercial — NO se usa para training.',
    website: 'https://anthropic.com',
    dpa: 'https://www.anthropic.com/legal/commercial-terms',
  },
  {
    name: 'Voyage AI',
    purpose: 'Embeddings semánticos para búsqueda RAG',
    location: 'Estados Unidos',
    dataShared: 'Título y contenido de cada documento al momento de embebearlo',
    website: 'https://voyageai.com',
    dpa: 'https://www.voyageai.com/policies',
  },
  {
    name: 'GitHub',
    purpose: 'Crons + agentes IA internos (no acceso a contenido cliente)',
    location: 'Estados Unidos',
    dataShared: 'Solo metadata operativa. NO contenido de clientes.',
    website: 'https://github.com',
    dpa: 'https://github.com/customer-terms/data-protection-agreement',
  },
  {
    name: 'Google',
    purpose: 'Drive + Gmail + Calendar OAuth (solo si conectas)',
    location: 'Estados Unidos',
    dataShared: 'Solo lo que autorizas en el OAuth consent. Tokens cifrados AES-256-GCM.',
    website: 'https://google.com',
    dpa: 'https://workspace.google.com/terms/dpa_terms.html',
  },
  {
    name: 'Slack',
    purpose: 'Slack OAuth (solo si conectas)',
    location: 'Estados Unidos',
    dataShared: 'Mensajes de canales autorizados. Tokens cifrados.',
    website: 'https://slack.com',
    dpa: 'https://slack.com/trust/data-protection-agreement',
  },
  {
    name: 'Notion',
    purpose: 'Notion OAuth (solo si conectas)',
    location: 'Estados Unidos',
    dataShared: 'Páginas y bases de datos autorizadas. Tokens cifrados.',
    website: 'https://notion.so',
    dpa: 'https://www.notion.so/Master-Subscription-Agreement-1c5c52c1-aab6-419f-b1a0-7caf24e15adf',
  },
]

const SubprocessorsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">cerebro</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Subprocesadores</h1>
        <p className="text-slate-500 text-sm mb-8">Última actualización: 7 de mayo de 2026</p>

        <div className="prose prose-slate prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed mb-8">
            Cerebro contrata a los siguientes subprocesadores para operar el Servicio.
            Cada uno cumple con sus propios estándares de privacidad y firma DPA con
            Cerebro. Notificamos por email a los clientes con <strong>al menos 14 días
            de antelación</strong> antes de añadir o cambiar subprocesadores.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-12">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700">Subprocesador</th>
                <th className="text-left p-4 font-semibold text-slate-700">Propósito</th>
                <th className="text-left p-4 font-semibold text-slate-700">Ubicación</th>
                <th className="text-left p-4 font-semibold text-slate-700">DPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name}>
                  <td className="p-4 align-top">
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-indigo-600">
                      {s.name}
                    </a>
                    <p className="text-xs text-slate-500 mt-1">{s.dataShared}</p>
                  </td>
                  <td className="p-4 align-top text-slate-700">{s.purpose}</td>
                  <td className="p-4 align-top text-slate-600 text-xs">{s.location}</td>
                  <td className="p-4 align-top">
                    <a href={s.dpa} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">
                      Ver DPA →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-3">Transferencias internacionales</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Los datos del Cliente se almacenan principalmente en infraestructura de
          proveedores ubicada en Estados Unidos. Cerebro asegura cláusulas
          contractuales tipo (SCC) con cada subprocesador o equivalente bajo
          legislación chilena vigente (Ley 21.719) y GDPR.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Cómo notificamos cambios</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Si cambiamos o agregamos subprocesadores, te avisamos por email a la
          dirección registrada en tu cuenta con al menos 14 días de antelación.
          Puedes oponerte por causa razonable enviando un correo a{' '}
          <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Lista canónica</h2>
        <p className="text-slate-700 leading-relaxed">
          Esta página en /subprocessors es la lista canónica y vigente. Está
          versionada en el repositorio público de Cerebro. Cualquier cambio
          aparece aquí primero.
        </p>

        <div className="border-t border-slate-200 mt-12 pt-6 flex gap-4 text-sm">
          <Link to="/privacy" className="text-indigo-600 hover:underline">Política de Privacidad</Link>
          <Link to="/terms" className="text-indigo-600 hover:underline">Términos de Servicio</Link>
          <Link to="/aup" className="text-indigo-600 hover:underline">Acceptable Use</Link>
          <Link to="/ai-disclosure" className="text-indigo-600 hover:underline">Aviso de IA</Link>
        </div>
      </main>
    </div>
  )
}

export default SubprocessorsPage
