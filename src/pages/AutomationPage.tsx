
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutomationDashboard } from '@/components/automation/AutomationDashboard'
import { ClaudeLovableIntegration } from '@/components/automation/ClaudeLovableIntegration'
import { N8nAIWorkflowBuilder } from '@/components/automation/N8nAIWorkflowBuilder'
import { MessageSquare, Code, Brain, Zap } from 'lucide-react'

const AutomationPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>
          <p className="text-gray-600">AI-powered automation with Claude, Lovable, and N8N integration</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="claude-lovable" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claude-lovable" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Claude ↔ Lovable
          </TabsTrigger>
          <TabsTrigger value="n8n-workflows" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            N8N AI Workflows
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claude-lovable">
          <ClaudeLovableIntegration />
        </TabsContent>

        <TabsContent value="n8n-workflows">
          <N8nAIWorkflowBuilder />
        </TabsContent>

        <TabsContent value="overview">
          <AutomationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AutomationPage
