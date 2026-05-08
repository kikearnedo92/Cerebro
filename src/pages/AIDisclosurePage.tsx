import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react'

const AIDisclosurePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Aviso de uso de Inteligencia Artificial</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">Última actualización: 7 de mayo de 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p className="text-base">
            Cerebro usa modelos de inteligencia artificial (IA) generativa para procesar
            tus consultas y generar respuestas. Este aviso explica cómo lo hacemos, qué
            modelos usamos y cuáles son los límites.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">¿Qué modelos de IA usamos?</h2>

            <div className="border border-slate-200 rounded-lg p-4 mb-3">
              <h3 className="font-semibold text-slate-900">Claude Sonnet 4.6 (Anthropic)</h3>
              <p className="text-sm mt-1">
                <strong>Uso:</strong> generación de respuestas en el chat, análisis de
                contexto, citaciones de documentos.<br />
                <strong>Por qué este modelo:</strong> es el modelo de Anthropic con mejor
                balance entre calidad de razonamiento, velocidad y costo.<br />
                <strong>Datos compartidos:</strong> texto del query + extractos de documentos
                relevantes recuperados de tu workspace. Bajo Commercial Terms de Anthropic,
                tus datos NO se usan para entrenar modelos.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 mb-3">
              <h3 className="font-semibold text-slate-900">Claude Haiku 4.5 (Anthropic)</h3>
              <p className="text-sm mt-1">
                <strong>Uso:</strong> tareas internas livianas (clasificación de signups
                del waitlist, generación de standups operativos).<br />
                <strong>Datos compartidos:</strong> los mismos términos comerciales aplican.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Voyage AI voyage-3-large (embeddings)</h3>
              <p className="text-sm mt-1">
                <strong>Uso:</strong> generar representaciones vectoriales (embeddings) de tus
                documentos para búsqueda semántica.<br />
                <strong>Datos compartidos:</strong> título y contenido del documento al
                momento de embebearlo. Voyage permite zero-day retention y no usa los datos
                para entrenar.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">¿Cómo flujo los datos?</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Conectas una integración (Drive, Notion, Slack, Gmail) a tu workspace</li>
              <li>Cerebro indexa el contenido autorizado en su DB cifrada (Supabase USA)</li>
              <li>Voyage AI calcula embeddings de cada documento</li>
              <li>Cuando preguntas algo, Cerebro recupera los documentos relevantes (búsqueda semántica)</li>
              <li>Esos extractos + tu query van a Claude (Anthropic) que genera la respuesta</li>
              <li>La respuesta vuelve a tu pantalla con citas a los documentos originales</li>
            </ol>
            <p className="text-sm text-slate-500 mt-4">
              Ningún proveedor de IA almacena tus datos a largo plazo. Anthropic y Voyage
              tienen políticas explícitas de no-entrenamiento bajo sus términos comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Limitaciones de la IA</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-2">
                  La IA puede equivocarse. Verifica antes de tomar decisiones críticas.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Las respuestas pueden contener errores fácticos ("alucinaciones")</li>
                  <li>El modelo puede malinterpretar contexto o instrucciones ambiguas</li>
                  <li>Las citas a documentos pueden tener desfases o referencias parciales</li>
                  <li>Información sobre eventos posteriores al training cutoff del modelo puede estar desactualizada</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Decisiones que NO debes delegar a la IA</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Decisiones médicas o de salud sin profesional certificado</li>
              <li>Decisiones legales con consecuencias significativas (contratos, litigios)</li>
              <li>Decisiones financieras de inversión sin asesor regulado</li>
              <li>Decisiones de contratación o despido (sesgos del modelo)</li>
              <li>Decisiones que afectan a terceros sin su consentimiento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Tu derecho a no usar IA</h2>
            <p>
              Cerebro requiere IA para funcionar (es el core del producto). Si no quieres
              que IA procese tu información, no es la herramienta para ti — te recomendamos
              usar herramientas de búsqueda tradicional (sin IA generativa).
            </p>
            <p className="mt-3">
              Si ya tienes cuenta y decides salir, puedes:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Exportar tus datos en formato JSON desde <Link to="/app/settings" className="text-indigo-600 underline">Configuración</Link></li>
              <li>Eliminar tu cuenta y todos los datos asociados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Contacto</h2>
            <p>
              ¿Preguntas sobre el uso de IA en Cerebro? Email:{' '}
              <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>
            </p>
          </section>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6 flex gap-4 text-sm">
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacidad</Link>
          <Link to="/terms" className="text-indigo-600 hover:underline">Términos</Link>
          <Link to="/aup" className="text-indigo-600 hover:underline">Acceptable Use</Link>
          <Link to="/subprocessors" className="text-indigo-600 hover:underline">Subprocesadores</Link>
        </div>
      </main>
    </div>
  )
}

export default AIDisclosurePage
