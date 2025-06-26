
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Play, Mic, Target, Code } from 'lucide-react'

export const WorkflowTemplates = () => {
  const templates = [
    {
      id: 1,
      name: "Voice → Strategy → Meta Ads",
      description: "Complete pipeline from voice input to Meta advertising campaign",
      icon: <Mic className="w-5 h-5 text-blue-500" />,
      complexity: "Advanced",
      nodes: 8,
      category: "Full Pipeline"
    },
    {
      id: 2,
      name: "Strategy → Google Ads",
      description: "Convert business strategy into Google Ads campaigns",
      icon: <Target className="w-5 h-5 text-green-500" />,
      complexity: "Medium",
      nodes: 5,
      category: "Advertising"
    },
    {
      id: 3,
      name: "Voice Transcription → Analysis",
      description: "Transcribe voice input and extract key business insights",
      icon: <Code className="w-5 h-5 text-purple-500" />,
      complexity: "Simple",
      nodes: 3,
      category: "Voice Processing"
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <p className="text-sm text-gray-600">
            Pre-built automation templates for common business processes
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-indigo-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {template.icon}
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{template.nodes} nodes</span>
                      <span className={`px-2 py-1 rounded ${
                        template.complexity === 'Simple' ? 'bg-green-100 text-green-700' :
                        template.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="w-3 h-3 mr-1" />
                      Clone
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Voice → Text transcription</li>
              <li>• Audio quality enhancement</li>
              <li>• Multi-language support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Business plan generation</li>
              <li>• Market analysis automation</li>
              <li>• Competitive intelligence</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Meta Ads creation</li>
              <li>• Google Ads optimization</li>
              <li>• Performance monitoring</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
