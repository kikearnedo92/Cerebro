
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import CerebroApp from './apps/CerebroApp'
import NucleoApp from './apps/NucleoApp'
import AppSelector from './components/AppSelector'

function App() {
  const { session, loading } = useAuth()

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

  return (
    <Router>
      <Routes>
        {/* Cerebro App Routes */}
        <Route path="/cerebro/*" element={<CerebroApp />} />
        
        {/* Núcleo App Routes */}
        <Route path="/nucleo/*" element={<NucleoApp />} />
        
        {/* Default route - App Selector */}
        <Route path="/" element={<AppSelector />} />
        
        {/* Catch all - redirect to app selector */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
