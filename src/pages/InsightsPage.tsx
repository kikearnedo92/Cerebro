
import React from 'react'
import { useLocation } from 'react-router-dom'
import { InsightsDashboard } from '@/components/insights/InsightsDashboard'
import { NucleoInsightsDashboard } from '@/components/insights/NucleoInsightsDashboard'

const InsightsPage = () => {
  const location = useLocation()
  const isNucleo = location.pathname.includes('/nucleo') || window.location.pathname.startsWith('/nucleo')

  return (
    <div className="container mx-auto px-4 py-6">
      {isNucleo ? <NucleoInsightsDashboard /> : <InsightsDashboard />}
    </div>
  )
}

export default InsightsPage
