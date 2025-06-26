
import React from 'react'
import { AutomationDashboard } from '@/components/automation/AutomationDashboard'

const AutomationPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>
          <p className="text-gray-600">Workflow automation and campaign management</p>
        </div>
      </div>

      <AutomationDashboard />
    </div>
  )
}

export default AutomationPage
