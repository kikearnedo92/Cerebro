
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Save, Play, Code } from 'lucide-react'

export const N8nWorkflowBuilder = () => {
  const [isEmbedded, setIsEmbedded] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>n8n Workflow Builder</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEmbedded(!isEmbedded)}
              >
                {isEmbedded ? 'Show External' : 'Embed Editor'}
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open n8n
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEmbedded ? (
            <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe 
                src="http://localhost:5678" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                title="n8n Workflow Editor"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">n8n Integration Ready</h3>
              <p className="text-gray-600 mb-4">
                Click "Embed Editor" to launch the integrated n8n workflow builder
              </p>
              <Badge variant="outline" className="mb-4">
                Localhost: http://localhost:5678
              </Badge>
              <div className="text-sm text-gray-500">
                <p>• Voice input processing workflows</p>
                <p>• Strategy generation automation</p>
                <p>• Campaign creation pipelines</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Save className="w-4 h-4 mr-2" />
              Save Current Workflow
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Play className="w-4 h-4 mr-2" />
              Test Workflow
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>OpenAI Whisper</span>
                <Badge variant="outline" className="text-xs">Voice</Badge>
              </div>
              <div className="flex justify-between">
                <span>GPT-4 Strategy</span>
                <Badge variant="outline" className="text-xs">AI</Badge>
              </div>
              <div className="flex justify-between">
                <span>Meta Business API</span>
                <Badge variant="outline" className="text-xs">Ads</Badge>
              </div>
              <div className="flex justify-between">
                <span>Google Ads API</span>
                <Badge variant="outline" className="text-xs">Ads</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
