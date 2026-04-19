import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-900 font-semibold">
            <Brain className="w-6 h-6 text-indigo-600" />
            Cerebro
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <h1>Política de Privacidad</h1>
        <p className="text-slate-500">Última actualización: 19 de abril de 2026</p>

        <h2>1. Información que recopilamos</h2>
        <p>
          Cerebro recopila únicamente la información necesaria para prestar el servicio de chat con IA
          conectado a las herramientas de tu empresa:
        </p>
        <ul>
          <li><strong>Datos de cuenta:</strong> email, nombre completo y datos de la empresa que proporcionas al registrarte.</li>
          <li><strong>Contenido de integraciones:</strong> cuando conectas Notion, Slack, Google Drive, Gmail o Calendar,
            accedemos al contenido que autorizas para indexarlo y responder a tus preguntas.</li>
          <li><strong>Conversaciones:</strong> los mensajes que intercambias con el chat de Cerebro para mejorar el servicio.</li>
          <li><strong>Datos de uso:</strong> métricas agregadas de uso (cantidad de consultas, documentos indexados).</li>
        </ul>

        <h2>2. Cómo usamos tus datos</h2>
        <ul>
          <li>Operar el servicio de chat con IA sobre tu base de conocimiento.</li>
          <li>Mantener seguras tus integraciones OAuth (tokens cifrados con AES-256-GCM).</li>
          <li>Facturación y gestión de tu plan.</li>
          <li>Mejorar el servicio basado en uso agregado (nunca contenido individual sin consentimiento).</li>
        </ul>

        <h2>3. Con quién compartimos datos</h2>
        <p>No vendemos ni compartimos tus datos con terceros. Utilizamos los siguientes proveedores para operar el servicio:</p>
        <ul>
          <li><strong>Anthropic (Claude API):</strong> procesa tus consultas para generar respuestas. Anthropic no entrena modelos con tus datos.</li>
          <li><strong>Supabase:</strong> base de datos y autenticación.</li>
          <li><strong>Vercel:</strong> hosting de la aplicación.</li>
          <li><strong>Stripe:</strong> procesamiento de pagos (cuando esté activo).</li>
        </ul>

        <h2>4. Tus derechos</h2>
        <p>Puedes en cualquier momento:</p>
        <ul>
          <li>Desconectar cualquier integración desde la sección Integraciones.</li>
          <li>Eliminar tu cuenta y todos tus datos asociados (contacta a soporte).</li>
          <li>Exportar tus conversaciones y datos.</li>
        </ul>

        <h2>5. Seguridad</h2>
        <p>
          Los tokens OAuth se cifran en reposo con AES-256-GCM. La comunicación es HTTPS-only.
          Aplicamos Row Level Security en Supabase para que ningún tenant pueda acceder a datos de otro.
        </p>

        <h2>6. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política, contáctanos en{' '}
          <a href="mailto:eduardoarnedog@gmail.com">eduardoarnedog@gmail.com</a>.
        </p>
      </main>
    </div>
  )
}
