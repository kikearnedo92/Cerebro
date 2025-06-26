
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, Play, Stop, Upload, Zap, MessageSquare, TrendingUp, Target } from 'lucide-react'

const LaunchPage = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)

  const handleStartRecording = () => {
    setIsRecording(true)
    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false)
      setHasRecording(true)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Launch</h1>
          <p className="text-gray-600">Voice onboarding and AI strategy generation</p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300">
          Voice-to-Strategy Engine
        </Badge>
      </div>

      {/* Voice Input Section */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-500" />
            Voice Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all ${
              isRecording 
                ? 'bg-red-100 border-4 border-red-300 animate-pulse' 
                : 'bg-orange-100 border-4 border-orange-300'
            }`}>
              <Mic className={`w-12 h-12 ${isRecording ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            
            {!hasRecording && !isRecording && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tell us about your business idea</h3>
                <p className="text-gray-600 mb-4">Describe your vision, target market, and goals</p>
                <Button onClick={handleStartRecording} className="bg-orange-500 hover:bg-orange-600">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            )}

            {isRecording && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">Recording...</h3>
                <p className="text-gray-600 mb-4">Speak clearly about your business idea</p>
                <Button variant="outline" onClick={() => setIsRecording(false)}>
                  <Stop className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {hasRecording && !isRecording && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">Recording Complete!</h3>
                <p className="text-gray-600 mb-4">Processing your voice input...</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setHasRecording(false)}>
                    Record Again
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Strategy
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Powered by Whisper AI</span>
              <span>Supports 99+ languages</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Generation Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Voice Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Transcription</span>
                <Badge variant="outline" className="text-xs">Whisper AI</Badge>
              </div>
              <div className="flex justify-between">
                <span>Language Detection</span>
                <Badge variant="outline" className="text-xs">Auto</Badge>
              </div>
              <div className="flex justify-between">
                <span>Content Analysis</span>
                <Badge variant="outline" className="text-xs">GPT-4</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Strategy Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Market Analysis</span>
                <Badge variant="outline" className="text-xs">AI Powered</Badge>
              </div>
              <div className="flex justify-between">
                <span>Target Audience</span>
                <Badge variant="outline" className="text-xs">Segments</Badge>
              </div>
              <div className="flex justify-between">
                <span>Campaign Ideas</span>
                <Badge variant="outline" className="text-xs">Creative</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Campaign Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Meta Ads</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span>Google Ads</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span>Automation</span>
                <Badge variant="outline" className="text-xs">n8n</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Voice Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">E-commerce Fitness Supplements</h4>
                <p className="text-sm text-gray-600">Generated strategy for health-conscious millennials</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Local Restaurant Chain</h4>
                <p className="text-sm text-gray-600">Multi-location dining experience campaign</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                In Progress
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LaunchPage
