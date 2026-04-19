import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
        <h1>Términos de Servicio</h1>
        <p className="text-slate-500">Última actualización: 19 de abril de 2026</p>

        <h2>1. Aceptación</h2>
        <p>
          Al crear una cuenta en Cerebro, aceptas estos Términos de Servicio. Si no estás de acuerdo, no utilices el servicio.
        </p>

        <h2>2. Descripción del servicio</h2>
        <p>
          Cerebro es un servicio SaaS B2B que permite a las empresas acceder a su conocimiento interno
          mediante un chat con IA que conecta con Notion, Slack, Google Drive, Gmail, Google Calendar
          y otras herramientas.
        </p>

        <h2>3. Uso aceptable</h2>
        <p>No puedes usar Cerebro para:</p>
        <ul>
          <li>Actividades ilegales o que infrinjan derechos de terceros.</li>
          <li>Generar spam, contenido malicioso o acoso.</li>
          <li>Intentar acceder a datos de otros tenants (Row Level Security previene esto técnicamente).</li>
          <li>Revender el servicio sin autorización escrita.</li>
        </ul>

        <h2>4. Planes y pagos</h2>
        <p>
          Los planes y precios están disponibles en <Link to="/pricing">la página de planes</Link>.
          Los pagos se procesan mediante Stripe. La facturación es mensual recurrente.
          Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período pagado.
        </p>

        <h2>5. Propiedad del contenido</h2>
        <p>
          El contenido que subes o conectas a Cerebro es tuyo. Cerebro solo lo usa para operar el servicio
          que has contratado. No entrenamos modelos de IA con tu contenido. No lo vendemos ni compartimos
          con terceros más allá de los proveedores necesarios para operar el servicio (ver Política de Privacidad).
        </p>

        <h2>6. Disponibilidad</h2>
        <p>
          Hacemos esfuerzos razonables para mantener el servicio operativo. No garantizamos disponibilidad 100%.
          No nos hacemos responsables por pérdidas derivadas de interrupciones de servicio.
        </p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>
          Cerebro se presta "tal cual". No nos hacemos responsables por daños indirectos, lucro cesante
          o pérdida de datos derivados del uso del servicio. Nuestra responsabilidad máxima está limitada
          a los pagos efectuados por el cliente en los últimos 12 meses.
        </p>

        <h2>8. Cancelación</h2>
        <p>
          Puedes cancelar tu cuenta en cualquier momento desde Configuración. Cerebro se reserva el derecho
          de suspender cuentas que violen estos términos.
        </p>

        <h2>9. Cambios</h2>
        <p>
          Podemos modificar estos términos. Te notificaremos cambios significativos por email con al menos
          30 días de anticipación.
        </p>

        <h2>10. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de Chile.</p>

        <h2>11. Contacto</h2>
        <p>
          Preguntas sobre estos términos:{' '}
          <a href="mailto:eduardoarnedog@gmail.com">eduardoarnedog@gmail.com</a>.
        </p>
      </main>
    </div>
  )
}
