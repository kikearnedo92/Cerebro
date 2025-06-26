
import React from 'react'
import { VoiceStrategyGenerator } from '@/components/launch/VoiceStrategyGenerator'

const LaunchPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Launch</h1>
          <p className="text-gray-600">Voice onboarding and AI strategy generation</p>
        </div>
      </div>

      <VoiceStrategyGenerator />
    </div>
  )
}

export default LaunchPage
