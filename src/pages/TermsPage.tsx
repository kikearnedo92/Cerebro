import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

const TermsPage = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos de Servicio</h1>
        <p className="text-slate-500 text-sm mb-8">Última actualización: 7 de mayo de 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Estos Términos de Servicio ("Términos") rigen el uso del software, sitio web,
            APIs y documentación de Cerebro (en conjunto, el "Servicio") provisto por
            Eduardo Arnedo González ("Cerebro", "nosotros") al cliente que crea una cuenta
            ("Cliente", "tú").
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">1. Aceptación</h2>
            <p>
              Al crear una cuenta o usar el Servicio, aceptas estos Términos y nuestra
              <Link to="/privacy" className="text-indigo-600 underline ml-1">Política de Privacidad</Link>.
              Si actúas en nombre de una empresa, declaras tener autoridad para vincularla.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">2. Descripción del Servicio</h2>
            <p>
              Cerebro es una plataforma SaaS que indexa contenido empresarial (Notion, Drive,
              Slack, Gmail, GitHub) para permitir consultas en lenguaje natural por humanos
              y agentes IA vía MCP (Model Context Protocol).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">3. Licencia de uso</h2>
            <p>
              Te otorgamos una licencia limitada, no exclusiva, no transferible, durante la
              vigencia de tu suscripción, para usar el Servicio según tu plan contratado.
              No puedes: (a) sublicenciar el Servicio, (b) hacer ingeniería inversa, (c) usar
              el Servicio para construir un producto competidor, (d) revender acceso a terceros
              fuera de tu workspace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">4. Cuentas y seguridad</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Eres responsable de mantener confidenciales tus credenciales</li>
              <li>Eres responsable de la actividad de tu workspace</li>
              <li>Debes notificar a hola@usacerebro.com cualquier uso no autorizado en menos de 24h</li>
              <li>El admin del workspace controla accesos, integraciones y API keys</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">5. Tu contenido</h2>
            <p>
              Mantienes todos los derechos sobre el contenido que conectes al Servicio (tu
              "Contenido"). Nos otorgas una licencia limitada para procesar y almacenar dicho
              Contenido únicamente con el fin de operar el Servicio para ti. No usamos tu
              Contenido para entrenar modelos ni lo compartimos con terceros para fines
              ajenos al Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">6. Pagos y facturación</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>El precio del plan contratado se cobra mensualmente por adelantado</li>
              <li>Aceptamos transferencia bancaria en Chile y, próximamente, tarjeta vía Stripe</li>
              <li>Si excedes el cupo de consultas incluidas, se factura al precio overage del plan</li>
              <li>Las facturas se emiten en CLP (clientes Chile) o USD según corresponda</li>
              <li>Facturación electrónica chilena (SII) para clientes con RUT chileno</li>
              <li>No hay reembolsos por períodos parcialmente usados, salvo error nuestro</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">7. Cambios al Servicio y a los Precios</h2>
            <p>
              Podemos modificar el Servicio o los precios. Cambios significativos se notifican
              con al menos 30 días de anticipación. Si no aceptas, puedes cancelar antes de la
              fecha efectiva del cambio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">8. Cancelación</h2>
            <p>
              Puedes cancelar en cualquier momento desde el panel de configuración o por email.
              La cancelación es efectiva al final del ciclo de facturación pagado. Tras la
              cancelación, tienes 30 días para exportar tus datos antes de la eliminación
              completa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">9. Uso aceptable</h2>
            <p>No puedes usar el Servicio para:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Procesar contenido ilegal, malicioso, infractor o que viole derechos de terceros</li>
              <li>Intentar acceder a workspaces ajenos o vulnerar la seguridad</li>
              <li>Generar carga abusiva (DDoS, scraping a velocidad anormal)</li>
              <li>Ofrecer el Servicio como fachada de un servicio competidor</li>
            </ul>
            <p className="mt-2">
              Podemos suspender o terminar cuentas que violen este uso aceptable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">10. Propiedad intelectual</h2>
            <p>
              El software, código, marca, logo, copy y documentación de Cerebro son propiedad
              de Eduardo Arnedo González. Tu Contenido sigue siendo tuyo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">11. Garantías y limitación de responsabilidad</h2>
            <p>
              EL SERVICIO SE PROVEE "TAL CUAL" SIN GARANTÍAS EXPRESAS NI IMPLÍCITAS. NO
              GARANTIZAMOS QUE LAS RESPUESTAS GENERADAS POR IA SEAN PRECISAS, COMPLETAS O LIBRES
              DE ERRORES. EL CLIENTE ES RESPONSABLE DE VERIFICAR LA INFORMACIÓN ANTES DE TOMAR
              DECISIONES CRÍTICAS.
            </p>
            <p className="mt-2">
              EN NINGÚN CASO LA RESPONSABILIDAD TOTAL DE CEREBRO EXCEDERÁ EL MONTO PAGADO
              POR EL CLIENTE EN LOS 12 MESES ANTERIORES AL EVENTO QUE ORIGINÓ EL RECLAMO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">12. Indemnización</h2>
            <p>
              El Cliente acepta indemnizar a Cerebro por reclamos derivados de su uso del
              Servicio en violación de estos Términos o por contenido ilícito que el Cliente
              haya conectado a su workspace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">13. Confidencialidad</h2>
            <p>
              Cada parte se compromete a no divulgar información confidencial de la otra
              recibida en el contexto del Servicio. Esta obligación sobrevive 3 años a la
              terminación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">14. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República de Chile. Cualquier
              controversia se someterá a los tribunales ordinarios de Santiago, salvo que
              ambas partes acuerden mediación o arbitraje voluntario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">15. Cambios a estos Términos</h2>
            <p>
              Podemos actualizar estos Términos. La versión vigente está siempre publicada
              en /terms con fecha de última actualización. Si los cambios son materiales,
              te avisaremos por email con al menos 30 días de antelación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">16. Contacto</h2>
            <p>
              Email: <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">hola@usacerebro.com</a><br />
              Responsable: Eduardo Arnedo González — Santiago, Chile
            </p>
          </section>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-6">
          <Link to="/privacy" className="text-indigo-600 hover:underline text-sm">
            Ver Política de Privacidad →
          </Link>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
