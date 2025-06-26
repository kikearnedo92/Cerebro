
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, TrendingUp, Zap, Clock } from 'lucide-react'

export const AutomationDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-indigo-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Executions Today</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Avg Time Saved</p>
                <p className="text-2xl font-bold">2.3h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Voice Strategy Generation</h3>
                <p className="text-sm text-gray-600">Processed voice input → Generated business strategy</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Success</Badge>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">45s</p>
                <p className="text-xs text-gray-500">execution time</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Meta Ads Campaign Creation</h3>
                <p className="text-sm text-gray-600">Strategy → Meta Business API → Active campaign</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Success</Badge>
                  <span className="text-xs text-gray-500">12 minutes ago</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">1m 23s</p>
                <p className="text-xs text-gray-500">execution time</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Google Ads Optimization</h3>
                <p className="text-sm text-gray-600">Performance analysis → Bid adjustments</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Failed</Badge>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">--</p>
                <p className="text-xs text-gray-500">timeout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Health */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Pipeline Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Voice Processing Pipeline</span>
                <span className="text-sm text-gray-500">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Strategy Generation</span>
                <span className="text-sm text-gray-500">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Campaign Automation</span>
                <span className="text-sm text-gray-500">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
