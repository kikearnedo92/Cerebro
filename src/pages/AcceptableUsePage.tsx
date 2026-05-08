import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

const AcceptableUsePage = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Uso Aceptable</h1>
        <p className="text-slate-500 text-sm mb-8">Última actualización: 7 de mayo de 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Esta Política de Uso Aceptable (AUP) complementa los <Link to="/terms" className="text-indigo-600 underline">Términos de Servicio</Link>
            y describe los usos prohibidos del Servicio Cerebro. La violación de esta AUP
            puede resultar en suspensión o terminación de la cuenta.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">1. Usos prohibidos</h2>
            <p>No puedes usar Cerebro para:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Contenido ilegal:</strong> indexar o procesar material que viole leyes locales o internacionales (ej. contenido de explotación infantil, terrorismo, drogas ilícitas).</li>
              <li><strong>Infracción de derechos:</strong> indexar contenido que viole derechos de propiedad intelectual de terceros (copyright, patentes, marcas) sin autorización.</li>
              <li><strong>Datos sensibles sin consentimiento:</strong> indexar datos personales de terceros (clientes, empleados) sin las autorizaciones legales correspondientes (Ley 21.719 Chile, GDPR, LGPD).</li>
              <li><strong>Acoso o difamación:</strong> generar contenido para acosar, difamar o discriminar a personas o grupos.</li>
              <li><strong>Fraude:</strong> usar el Servicio para esquemas fraudulentos, phishing, ingeniería social.</li>
              <li><strong>Información médica o financiera regulada</strong> sin las certificaciones que requiere tu jurisdicción (HIPAA, PCI-DSS, etc).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">2. Abuso técnico</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Intentar acceder a workspaces ajenos o vulnerar la seguridad del Servicio</li>
              <li>Realizar scraping a velocidad anormal o intentar saturar la API (DDoS)</li>
              <li>Hacer ingeniería inversa, descompilar o intentar extraer código fuente</li>
              <li>Compartir credenciales o tokens de API con terceros no autorizados</li>
              <li>Eludir límites de uso del plan contratado por medios técnicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">3. Uso comercial competidor</h2>
            <p>
              No puedes usar el Servicio para construir un producto competidor, ofrecer
              un servicio derivado de Cerebro a terceros, o usar la plataforma como
              fachada de un servicio que reemplace partes de Cerebro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">4. Uso de IA generativa</h2>
            <p>
              Cerebro usa IA generativa (Claude Sonnet 4.6) para generar respuestas.
              Aceptas que:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Las respuestas pueden contener errores o información inexacta</li>
              <li>NO uses Cerebro como única fuente para decisiones críticas (médicas, legales, financieras) sin verificación humana</li>
              <li>NO presentes contenido generado como propio cuando legalmente requiera autoría humana</li>
              <li>NO uses el Servicio para generar deepfakes o desinformación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">5. Reportar abuso</h2>
            <p>
              Si detectas uso indebido del Servicio o tienes preocupaciones sobre el
              comportamiento de otro usuario, repórtalo a{' '}
              <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>
              {' '}con asunto <code className="bg-slate-100 px-1 rounded">[abuse]</code>.
              Investigamos en menos de 48 horas hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">6. Consecuencias</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Primera violación menor:</strong> aviso por email + 7 días para corregir</li>
              <li><strong>Violación grave:</strong> suspensión inmediata del workspace</li>
              <li><strong>Violación criminal:</strong> terminación + reporte a autoridades cuando corresponda</li>
              <li><strong>Reincidencia:</strong> terminación permanente sin reembolso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">7. Cambios a esta AUP</h2>
            <p>
              Si modificamos esta AUP, te avisaremos por email con al menos 30 días de
              antelación. El uso continuado del Servicio tras los cambios implica
              aceptación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">8. Contacto</h2>
            <p>
              Email: <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>
            </p>
          </section>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6 flex gap-4 text-sm">
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacidad</Link>
          <Link to="/terms" className="text-indigo-600 hover:underline">Términos</Link>
          <Link to="/subprocessors" className="text-indigo-600 hover:underline">Subprocesadores</Link>
          <Link to="/ai-disclosure" className="text-indigo-600 hover:underline">Aviso de IA</Link>
        </div>
      </main>
    </div>
  )
}

export default AcceptableUsePage
