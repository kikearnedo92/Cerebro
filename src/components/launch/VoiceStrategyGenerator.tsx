
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, Square, Play, Upload, Zap, Download, Copy } from 'lucide-react'

export const VoiceStrategyGenerator = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [strategy, setStrategy] = useState<any>(null)

  const handleStartRecording = () => {
    setIsRecording(true)
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false)
      setHasRecording(true)
    }, 3000)
  }

  const handleGenerateStrategy = () => {
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setStrategy({
        businessConcept: "AI-powered fitness app for busy professionals",
        targetAudience: "Working professionals aged 25-40 with limited time for gym",
        keyMessages: [
          "Get fit in just 15 minutes a day",
          "AI personal trainer in your pocket",
          "No gym membership required"
        ],
        campaignIdeas: [
          {
            platform: "Meta Ads",
            objective: "Lead Generation",
            budget: "$2,000/month",
            targeting: "Professionals, fitness interests, mobile users"
          },
          {
            platform: "Google Ads",
            objective: "App Downloads",
            budget: "$1,500/month", 
            targeting: "Fitness app keywords, competitor targeting"
          }
        ],
        nextSteps: [
          "Create landing page with 15-min workout preview",
          "Develop video testimonials from beta users",
          "Set up conversion tracking",
          "Launch MVP campaign with $500 test budget"
        ]
      })
    }, 4000)
  }

  return (
    <div className="space-y-6">
      {/* Voice Input */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-500" />
            Voice Business Input
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
                <h3 className="text-lg font-semibold mb-2">Describe your business idea</h3>
                <p className="text-gray-600 mb-4">Tell us about your vision, target market, and goals</p>
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
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {hasRecording && !isRecording && !strategy && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">Recording Complete!</h3>
                <p className="text-gray-600 mb-4">Ready to generate your strategy</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setHasRecording(false)}>
                    Record Again
                  </Button>
                  <Button onClick={handleGenerateStrategy} className="bg-orange-500 hover:bg-orange-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Strategy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              AI Strategy Generation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Analyzing your business concept...</div>
                <Progress value={33} className="w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">Voice Transcription</div>
                  <div className="text-blue-600">✓ Complete</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium">Market Analysis</div>
                  <div className="text-yellow-600">⟳ Processing</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Campaign Generation</div>
                  <div className="text-gray-600">⏳ Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Strategy */}
      {strategy && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  AI-Generated Business Strategy
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Concept */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Business Concept</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{strategy.businessConcept}</p>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Target Audience</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{strategy.targetAudience}</p>
              </div>

              {/* Key Messages */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Messages</h3>
                <div className="space-y-2">
                  {strategy.keyMessages.map((message: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Ideas */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Campaign Ideas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategy.campaignIdeas.map((campaign: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{campaign.platform}</Badge>
                            <span className="font-bold text-green-600">{campaign.budget}</span>
                          </div>
                          <div className="font-medium">{campaign.objective}</div>
                          <div className="text-sm text-gray-600">{campaign.targeting}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Recommended Next Steps</h3>
                <div className="space-y-2">
                  {strategy.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Badge variant="outline" className="bg-purple-100">{index + 1}</Badge>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Campaigns
                </Button>
                <Button variant="outline">
                  Refine Strategy
                </Button>
                <Button variant="outline" onClick={() => {
                  setStrategy(null)
                  setHasRecording(false)
                }}>
                  New Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
