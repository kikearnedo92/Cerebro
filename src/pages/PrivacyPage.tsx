import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

const PrivacyPage = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
        <p className="text-slate-500 text-sm mb-8">Última actualización: 7 de mayo de 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Esta Política de Privacidad describe cómo Cerebro ("nosotros", "el Servicio")
            recopila, utiliza, almacena y protege la información que el Cliente y los
            Usuarios Finales nos proporcionan al usar la plataforma disponible en
            <span className="font-mono"> cerebro-ivory.vercel.app</span> (el "Servicio").
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">1. Quién recopila la información</h2>
            <p>
              El responsable del tratamiento de datos es Eduardo Arnedo González, con domicilio
              en Santiago, Chile. Para consultas sobre privacidad: <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">2. Información que recopilamos</h2>
            <h3 className="font-semibold text-slate-900 mt-4">2.1 Información de cuenta</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Email, nombre, nombre de empresa, tamaño del equipo</li>
              <li>Credenciales de autenticación (gestionadas por Supabase Auth, password hasheado)</li>
            </ul>
            <h3 className="font-semibold text-slate-900 mt-4">2.2 Contenido del workspace</h3>
            <p>
              Cuando conectas integraciones (Google Drive, Notion, Slack, Gmail, GitHub),
              Cerebro indexa el contenido de los documentos, mensajes y archivos a los que
              autorizas acceso. Este contenido se almacena cifrado en reposo en infraestructura
              Supabase (Postgres en AWS us-east-2). Los tokens OAuth se cifran con AES-256-GCM.
            </p>
            <h3 className="font-semibold text-slate-900 mt-4">2.3 Datos de uso</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Logs de cada consulta al chat o al MCP server (retención 90 días)</li>
              <li>IP, user-agent, UTM source/medium/campaign del waitlist</li>
              <li>Latencia, errores, métricas de calidad de respuesta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">3. Cómo usamos la información</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Operar el Servicio: indexar contenido, generar respuestas, mantener sesiones</li>
              <li>Mejorar la calidad: detectar errores, optimizar latencia y precisión</li>
              <li>Comunicación operativa: avisos de cambios, mantenimientos, alertas de seguridad</li>
              <li>Cumplimiento legal: responder a requerimientos de autoridad competente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">4. Lo que NO hacemos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>NO vendemos datos a terceros.</strong> Nunca.</li>
              <li><strong>NO usamos tu contenido para entrenar modelos.</strong> Tu información no se incluye en datasets de fine-tuning ni se comparte con Anthropic, Voyage AI ni ningún otro proveedor para entrenamiento.</li>
              <li><strong>NO accedemos manualmente a tu workspace</strong> excepto si nos das permiso explícito para resolver un ticket de soporte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">5. Subprocesadores</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2">Subprocesador</th>
                  <th className="text-left py-2">Propósito</th>
                  <th className="text-left py-2">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-2">Supabase</td><td>Auth + DB + Storage</td><td>AWS us-east-2 (USA)</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2">Vercel</td><td>Hosting frontend + serverless</td><td>USA / Global edge</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2">Anthropic</td><td>Procesamiento LLM (chat)</td><td>USA</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2">Voyage AI</td><td>Embeddings semánticos</td><td>USA</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2">GitHub</td><td>Crons + agentes IA internos</td><td>USA</td></tr>
                <tr className="border-b border-slate-100"><td className="py-2">Google / Slack / Notion</td><td>Integraciones OAuth (solo si las conectas)</td><td>USA</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">6. Retención y eliminación</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Contenido indexado: mientras la cuenta esté activa o hasta que lo elimines manualmente</li>
              <li>Logs de uso: 90 días</li>
              <li>Backups cifrados: 30 días</li>
              <li>Si cancelas tu cuenta: borrado completo dentro de 30 días</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">7. Tus derechos</h2>
            <p>
              De acuerdo con la Ley 19.628 sobre Protección de la Vida Privada (Chile), GDPR (UE)
              y LGPD (Brasil) en lo que aplica, tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Acceder a tus datos almacenados</li>
              <li>Rectificar información incorrecta</li>
              <li>Eliminar tu cuenta y datos asociados</li>
              <li>Exportar tus datos en formato legible (JSON)</li>
              <li>Oponerte a procesamiento adicional</li>
            </ul>
            <p className="mt-2">
              Para ejercer cualquier derecho: <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a>.
              Respondemos en menos de 30 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">8. Seguridad</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>TLS 1.3 en todas las comunicaciones</li>
              <li>Cifrado AES-256-GCM para tokens OAuth en reposo</li>
              <li>Row-Level Security (RLS) estricta por tenant en Postgres</li>
              <li>Aislamiento por workspace — un cliente nunca puede ver datos de otro</li>
              <li>Auditoría de cambios en tablas críticas</li>
              <li>Rate limiting en endpoints públicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">9. Transferencias internacionales</h2>
            <p>
              Los datos se almacenan en infraestructura de proveedores ubicada principalmente en
              Estados Unidos. Al usar el Servicio, aceptas estas transferencias internacionales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">10. Cookies</h2>
            <p>
              Usamos cookies estrictamente necesarias para autenticación (sesión Supabase) y
              opcionalmente cookies analíticas para entender el uso agregado del Servicio (puedes
              rechazarlas). No usamos cookies de tracking publicitario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">11. Cambios a esta política</h2>
            <p>
              Si modificamos esta política, te avisaremos por email con al menos 14 días de
              antelación. Los cambios significativos requieren tu consentimiento renovado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">12. Contacto</h2>
            <p>
              Email: <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a><br />
              Responsable: Eduardo Arnedo González — Santiago, Chile
            </p>
          </section>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6">
          <Link to="/terms" className="text-indigo-600 hover:underline text-sm">
            Ver Términos de Servicio →
          </Link>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPage
