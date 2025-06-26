
import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import CerebroApp from './apps/CerebroApp'
import NucleoApp from './apps/NucleoApp'
import AppSelector from './components/AppSelector'

function App() {
  const { session, loading } = useAuth()
  const [currentApp, setCurrentApp] = useState<'cerebro' | 'nucleo' | null>(null)

  useEffect(() => {
    // Determine which app to show based on URL path
    const path = window.location.pathname
    if (path.startsWith('/cerebro')) {
      setCurrentApp('cerebro')
    } else if (path.startsWith('/nucleo')) {
      setCurrentApp('nucleo')
    } else {
      // Default routing logic
      setCurrentApp(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Inicializando plataforma...</p>
        </div>
      </div>
    )
  }

  // If no specific app is selected, show app selector
  if (!currentApp) {
    return <AppSelector />
  }

  // Render the appropriate app
  if (currentApp === 'cerebro') {
    return <CerebroApp />
  }

  if (currentApp === 'nucleo') {
    return <NucleoApp />
  }

  return <AppSelector />
}

export default App
