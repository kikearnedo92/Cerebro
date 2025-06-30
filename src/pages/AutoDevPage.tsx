
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutoDevDashboard } from '@/components/autodev/AutoDevDashboard'
import { ProductIntegrationSetup } from '@/components/autodev/ProductIntegrationSetup'
import { Github, Webhook, BarChart3, Code } from 'lucide-react'

const AutoDevPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AutoDev</h1>
            <p className="text-gray-600">AI-powered development with multiple integration options</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="integration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Product Integration
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Development Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integration">
            <ProductIntegrationSetup />
          </TabsContent>

          <TabsContent value="dashboard">
            <AutoDevDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Development Analytics</h3>
              <p className="text-gray-600">
                Métricas de mejoras implementadas, impacto en conversión, y performance del sistema AutoDev
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AutoDevPage
