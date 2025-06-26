
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Play, Pause, Settings, TrendingUp, Zap } from 'lucide-react'
import { N8nWorkflowBuilder } from './N8nWorkflowBuilder'
import { WorkflowTemplates } from './WorkflowTemplates'

export const AutomationDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const workflows = [
    {
      id: '1',
      name: 'Voice → Meta Ads Pipeline',
      status: 'active',
      runs: 24,
      lastRun: '2 hours ago',
      success: 95
    },
    {
      id: '2', 
      name: 'Google Ads Optimization',
      status: 'paused',
      runs: 18,
      lastRun: '1 day ago',
      success: 88
    },
    {
      id: '3',
      name: 'Strategy Generation Bot',
      status: 'active',
      runs: 42,
      lastRun: '30 minutes ago',
      success: 92
    }
  ]

  if (activeTab === 'builder') {
    return <N8nWorkflowBuilder />
  }

  if (activeTab === 'templates') {
    return <WorkflowTemplates />
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'bg-white shadow-sm' : ''}
        >
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'builder' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('builder')}
          className={activeTab === 'builder' ? 'bg-white shadow-sm' : ''}
        >
          Workflow Builder
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
          className={activeTab === 'templates' ? 'bg-white shadow-sm' : ''}
        >
          Templates
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <Bot className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-purple-600">156h</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    workflow.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-gray-600">
                      {workflow.runs} runs • Last: {workflow.lastRun} • {workflow.success}% success
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline"
                    className={workflow.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
                  >
                    {workflow.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Automation Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Complete voice-to-campaign automation using n8n workflows
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Voice Input (Whisper)</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Strategy Generation (GPT-4)</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Campaign Creation (Meta/Google)</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
            </div>
            <Button className="w-full" onClick={() => setActiveTab('builder')}>
              <Bot className="w-4 h-4 mr-2" />
              Build Pipeline
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Automated A/B testing and budget optimization workflows
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Monitoring</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Budget Reallocation</span>
                <Badge variant="outline" className="text-xs">Auto</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Creative Testing</span>
                <Badge variant="outline" className="text-xs">Scheduled</Badge>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setActiveTab('templates')}>
              <Settings className="w-4 h-4 mr-2" />
              View Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
