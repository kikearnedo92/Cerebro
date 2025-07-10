
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
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Behavioral Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {isNucleo ? <NucleoInsightsDashboard /> : <RetornaInsightsDashboard />}
        </TabsContent>

        <TabsContent value="ai-agents">
          <BehavioralAnalyticsAgent />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InsightsPage
