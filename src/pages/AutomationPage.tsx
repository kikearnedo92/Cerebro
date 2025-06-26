
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Zap, Activity, Settings, Play, Pause } from 'lucide-react'
import { N8nWorkflowBuilder } from '@/components/automation/N8nWorkflowBuilder'
import { AutomationDashboard } from '@/components/automation/AutomationDashboard'
import { WorkflowTemplates } from '@/components/automation/WorkflowTemplates'

const AutomationPage = () => {
  return (
    <ProtectedRoute 
      featureFlag="automation_n8n"
      fallbackTitle="Automation - Núcleo Exclusivo"
      fallbackMessage="El motor de automatización n8n está disponible solo en Núcleo para crear flujos automatizados desde voz hasta campañas."
    >
      <div className="h-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-500" />
              Automation Engine
            </h1>
            <p className="text-gray-600">
              Motor de automatización powered by n8n - Voice → Strategy → Campaign pipeline
            </p>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            n8n Integrated
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AutomationDashboard />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Voice → Strategy Pipeline</h3>
                      <p className="text-sm text-gray-600">Converts voice input to business strategy</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Strategy → Ads Campaign</h3>
                      <p className="text-sm text-gray-600">Auto-creates Meta/Google Ads from strategy</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Paused</Badge>
                      <Pause className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <N8nWorkflowBuilder />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <WorkflowTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

export default AutomationPage
