import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cerebro_cookie_consent_v1'

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (!consent) setVisible(true)
    } catch {
      // localStorage may be blocked — show banner anyway
      setVisible(true)
    }
  }, [])

  const setConsent = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl p-4 text-sm">
      <button
        onClick={() => setConsent('essential')}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-slate-700 leading-relaxed pr-6">
        Usamos cookies <strong>estrictamente necesarias</strong> para mantener tu sesión.
        Con tu consentimiento usamos cookies analíticas para mejorar el producto.
        No usamos cookies de tracking publicitario.
      </p>
      <p className="text-slate-500 text-xs mt-2">
        Detalle en nuestra{' '}
        <Link to="/privacy" className="text-indigo-600 underline">Política de Privacidad</Link>.
      </p>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setConsent('essential')}>
          Solo necesarias
        </Button>
        <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => setConsent('all')}>
          Aceptar todas
        </Button>
      </div>
    </div>
  )
}

export default CookieBanner
