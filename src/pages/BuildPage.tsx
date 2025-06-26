
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code, Terminal, Zap, GitBranch, Database, Globe } from 'lucide-react'

const BuildPage = () => {
  const [activeProject, setActiveProject] = useState('web-app')

  const projects = [
    {
      id: 'web-app',
      name: 'E-commerce Platform',
      type: 'React + Node.js',
      status: 'In Progress',
      completion: 75
    },
    {
      id: 'mobile-app',
      name: 'Fitness Tracker',
      type: 'React Native',
      status: 'Planning',
      completion: 25
    },
    {
      id: 'api-service',
      name: 'Analytics API',
      type: 'Python + FastAPI',
      status: 'Testing',
      completion: 90
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AutoDev</h1>
          <p className="text-gray-600">AI-powered development and code generation</p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300">
          AI Development Suite
        </Badge>
      </div>

      {/* Code Generation Interface */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            AI Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Project Requirements</h3>
              <div className="p-4 bg-gray-50 rounded-lg min-h-32">
                <p className="text-sm text-gray-600 mb-2">Current Specifications:</p>
                <ul className="text-sm space-y-1">
                  <li>• React frontend with TypeScript</li>
                  <li>• Node.js backend with Express</li>
                  <li>• PostgreSQL database</li>
                  <li>• Authentication with JWT</li>
                  <li>• RESTful API endpoints</li>
                </ul>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Zap className="w-4 h-4 mr-2" />
                Generate Code
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Generated Output</h3>
              <div className="p-4 bg-gray-900 rounded-lg min-h-32 text-green-400 font-mono text-sm">
                <div className="mb-2">$ npm create react-app my-project --template typescript</div>
                <div className="mb-2">$ cd my-project && npm install express jsonwebtoken</div>
                <div className="mb-2">✓ Frontend structure created</div>
                <div className="mb-2">✓ Backend API configured</div>
                <div className="text-yellow-400">⚡ Generating database schema...</div>
              </div>
              <Button variant="outline" className="w-full">
                <Terminal className="w-4 h-4 mr-2" />
                Open Terminal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Active Development Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  activeProject === project.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveProject(project.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={
                      project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      project.status === 'Testing' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-700'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{project.type}</span>
                  <span>{project.completion}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-green-500" />
              Version Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Git Integration</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Auto Commits</span>
                <Badge variant="outline" className="text-xs">Enabled</Badge>
              </div>
              <div className="flex justify-between">
                <span>Branch Protection</span>
                <Badge variant="outline" className="text-xs">Main</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Schema Generation</span>
                <Badge variant="outline" className="text-xs">Auto</Badge>
              </div>
              <div className="flex justify-between">
                <span>Migrations</span>
                <Badge variant="outline" className="text-xs">Synced</Badge>
              </div>
              <div className="flex justify-between">
                <span>Backup</span>
                <Badge variant="outline" className="text-xs">Daily</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Auto Deploy</span>
                <Badge variant="outline" className="text-xs">Vercel</Badge>
              </div>
              <div className="flex justify-between">
                <span>Preview URLs</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span>CI/CD Pipeline</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BuildPage
