
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Toaster } from './components/ui/toaster'
import CerebroApp from './apps/CerebroApp'
import NucleoApp from './apps/NucleoApp'
import AppSelector from './components/AppSelector'

function App() {
  const { loading } = useAuth()
  const [currentApp, setCurrentApp] = useState<string | null>(null)

  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/cerebro')) {
      setCurrentApp('cerebro')
    } else if (path.startsWith('/nucleo')) {
      setCurrentApp('nucleo')
    } else {
      setCurrentApp(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* App Selector */}
          <Route path="/" element={<AppSelector />} />
          
          {/* Cerebro App - Internal Knowledge Platform */}
          <Route path="/cerebro/*" element={<CerebroApp />} />
          
          {/* Núcleo App - Commercial AI Platform */}
          <Route path="/nucleo/*" element={<NucleoApp />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
