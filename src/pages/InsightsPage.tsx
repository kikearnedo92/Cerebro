
import React from 'react'
import { useLocation } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, TrendingUp, BarChart3 } from 'lucide-react'
import { RetornaInsightsDashboard } from '@/components/insights/RetornaInsightsDashboard'
import { NucleoInsightsDashboard } from '@/components/insights/NucleoInsightsDashboard'
import { BehavioralAnalyticsAgent } from '@/components/insights/BehavioralAnalyticsAgent'

const InsightsPage = () => {
  const location = useLocation()
  const isNucleo = location.pathname.startsWith('/nucleo')

  console.log('🔍 InsightsPage - Current path:', location.pathname, 'Is Núcleo:', isNucleo)

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
      {/* Solo mostrar AI Behavioral Analytics con datos reales */}
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1 flex-shrink-0"></div>
            <div className="min-w-0">
              <h3 className="font-semibold text-green-800 text-sm sm:text-base">✅ DATOS REALES de Amplitude</h3>
              <p className="text-xs sm:text-sm text-green-700 mt-1">
                Análisis basado en usuarios activos REALES de tu proyecto de Amplitude. Sin datos simulados.
              </p>
            </div>
          </div>
        </div>
        
        <BehavioralAnalyticsAgent />
      </div>
    </div>
  )
}

export default InsightsPage
