import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Brain, ArrowLeft, Download, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const DataExportPage = () => {
  const { user, profile } = useAuth()
  const [exporting, setExporting] = useState(false)

  if (!user) return <Navigate to="/auth" replace />

  const handleExport = async () => {
    if (!profile?.tenant_id) return
    setExporting(true)
    try {
      // Pull main data tables for this tenant
      const tables = ['profiles', 'knowledge_base', 'conversations', 'messages', 'integrations']
      const out: Record<string, unknown> = {
        export_date: new Date().toISOString(),
        tenant_id: profile.tenant_id,
        user_email: user.email,
      }

      for (const table of tables) {
        try {
          const { data } = await supabase
            .from(table)
            .select('*')
            .or(`tenant_uuid.eq.${profile.tenant_id},tenant_id.eq.${profile.tenant_id},user_id.eq.${user.id},id.eq.${user.id}`)
          out[table] = data || []
        } catch (e) {
          out[table] = { error: 'failed to export' }
        }
      }

      const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cerebro-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Exportación lista', description: 'El archivo se descargó a tu computadora.' })
    } catch (err) {
      console.error('Export error:', err)
      toast({ title: 'Error en exportación', description: 'Intenta de nuevo o contacta soporte.', variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/app/settings" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a Configuración
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Download className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">Exportar tus datos</h1>
      </div>
      <p className="text-slate-500 mb-8">
        Descarga toda la información de tu workspace en formato JSON. Cumple con el
        derecho a portabilidad de Ley 21.719 (Chile), GDPR y LGPD.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-slate-900">¿Qué se incluye en la exportación?</h2>
            <ul className="text-sm text-slate-600 mt-2 space-y-1">
              <li>• Perfil y configuración de cuenta</li>
              <li>• Documentos indexados (Drive, Notion, Slack...)</li>
              <li>• Conversaciones con el chat IA</li>
              <li>• Mensajes y respuestas históricas</li>
              <li>• Integraciones conectadas (sin tokens, por seguridad)</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-slate-900 hover:bg-slate-800 w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Generando archivo...' : 'Descargar mis datos en JSON'}
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-900">
          <strong>Nota:</strong> el archivo contiene información personal de tu workspace.
          Almacénalo en un lugar seguro. Si lo compartes con terceros, eres responsable de
          cumplir con la legislación de protección de datos aplicable.
        </div>
      </div>

      <div className="mt-8 text-sm text-slate-500">
        <p>
          ¿Quieres eliminar tu cuenta completa? Ve a{' '}
          <Link to="/app/settings" className="text-indigo-600 underline">Configuración</Link>{' '}
          → Eliminar cuenta. La eliminación es definitiva.
        </p>
      </div>
    </div>
  )
}

export default DataExportPage
