import React, { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface SyncStats {
  pending: number
  processing: number
  done: number
  error: number
  total: number
  percentage: number
  finished: boolean
  warning: string | null
}

interface DriveSyncProgressProps {
  /** Set to true after the user clicks "Sincronizar". Triggers polling. */
  active: boolean
  /** Called once finished (pending+processing == 0 and total > 0). */
  onFinished?: () => void
}

/**
 * Polls drive sync_status every 5s while active. Shows a progress bar
 * with done/total + ETA-style messaging. Auto-stops when done.
 */
const DriveSyncProgress: React.FC<DriveSyncProgressProps> = ({ active, onFinished }) => {
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [startedAt] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    let cancelled = false

    const poll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-drive-integration', {
          body: { action: 'sync_status', service: 'drive' },
        })
        if (error) throw error
        if (cancelled) return

        const s: SyncStats = {
          pending: data.pending || 0,
          processing: data.processing || 0,
          done: data.done || 0,
          error: data.error || 0,
          total: data.total || 0,
          percentage: data.percentage || 0,
          finished: !!data.finished,
          warning: data.warning || null,
        }
        setStats(s)

        if (s.finished && s.total > 0) {
          onFinished?.()
        }
      } catch (err) {
        console.error('sync_status poll error:', err)
      }
    }

    // Poll immediately, then every 5s
    poll()
    const interval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [active, onFinished])

  if (!active || !stats || stats.total === 0) return null

  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  const isLong = elapsed > 60 // > 1 min

  // Display percentage: floor (not round) so 99.5% shows 99%, not 100%.
  // 100% reserved for actual completion (all rows done/error/skipped).
  const displayPct = stats.finished ? 100 : Math.min(99, Math.floor(((stats.done + stats.error) / stats.total) * 100))

  if (stats.finished) {
    return (
      <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-900">Sincronización completa</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {stats.done} archivos indexados{stats.error > 0 ? ` · ${stats.error} con errores` : ''}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-indigo-900">
          Sincronizando {stats.done + stats.error} de {stats.total}
        </p>
        <span className="ml-auto text-sm font-bold text-indigo-700">
          {displayPct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${displayPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-indigo-700">
        <span>
          {stats.processing > 0 && `${stats.processing} en proceso · `}
          {stats.pending} pendientes
        </span>
        <span>{elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`}</span>
      </div>

      {/* Warning if it's taking too long */}
      {(stats.warning || isLong) && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {stats.warning ||
              'Esto puede tardar unos minutos la primera vez si tienes muchos documentos. Puedes cerrar esta página — el sync sigue en background.'}
          </span>
        </div>
      )}

      {stats.error > 0 && (
        <p className="text-xs text-red-700 mt-1">
          {stats.error} archivos no se pudieron procesar (se reintentarán automáticamente).
        </p>
      )}
    </div>
  )
}

export default DriveSyncProgress
