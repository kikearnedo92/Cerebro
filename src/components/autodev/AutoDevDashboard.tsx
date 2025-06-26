
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Code, GitBranch, Bot, Zap, Play, Download, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export const AutoDevDashboard = () => {
  const [currentProject, setCurrentProject] = useState('e-commerce-app')

  const projects = [
    {
      id: 'e-commerce-app',
      name: 'E-commerce App',
      status: 'In Progress',
      progress: 75,
      description: 'Modern e-commerce platform with AI recommendations',
      tech: ['React', 'TypeScript', 'Supabase', 'Stripe']
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      status: 'Completed',
      progress: 100,
      description: 'Real-time analytics dashboard for business metrics',
      tech: ['Next.js', 'D3.js', 'PostgreSQL']
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      status: 'Planning',
      progress: 15,
      description: 'Cross-platform mobile app with React Native',
      tech: ['React Native', 'Expo', 'Firebase']
    }
  ]

  const tasks = [
    {
      id: 1,
      title: 'Implement user authentication system',
      status: 'completed',
      priority: 'high',
      estimatedTime: '2 hours',
      actualTime: '1.5 hours'
    },
    {
      id: 2,
      title: 'Create product catalog component',
      status: 'in-progress',
      priority: 'high',
      estimatedTime: '3 hours',
      actualTime: null
    },
    {
      id: 3,
      title: 'Set up payment processing',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '4 hours',
      actualTime: null
    },
    {
      id: 4,
      title: 'Add search and filtering',
      status: 'pending',
      priority: 'low',
      estimatedTime: '2.5 hours',
      actualTime: null
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
        <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
          AI Development Engine
        </Badge>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id}
            className={`cursor-pointer transition-all ${
              currentProject === project.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => setCurrentProject(project.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <Badge 
                  variant={project.status === 'Completed' ? 'default' : 'outline'}
                  className={
                    project.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {project.tech.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="code-gen" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code-gen">Code Generation</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="claude-chat">Claude Integration</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="code-gen" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-500" />
                  Code Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Component Name</label>
                  <Input placeholder="e.g., ProductCard, UserProfile" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Describe what this component should do..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Framework</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>React + TypeScript</option>
                    <option>Vue.js</option>
                    <option>Angular</option>
                    <option>Svelte</option>
                  </select>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create New Feature Branch
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Code className="w-4 h-4 mr-2" />
                  Generate API Endpoints
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Play className="w-4 h-4 mr-2" />
                  Run Tests
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Development Tasks
                </span>
                <Button size="sm">Add Task</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          Est: {task.estimatedTime}
                          {task.actualTime && ` • Actual: ${task.actualTime}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={
                          task.priority === 'high' ? 'border-red-200 text-red-700' :
                          task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-gray-200 text-gray-700'
                        }
                      >
                        {task.priority}
                      </Badge>
                      {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {task.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-500" />}
                      {task.status === 'pending' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claude-chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Claude AI Development Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-lg p-4 h-64 overflow-y-auto mb-4">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-600 mb-1">Claude</div>
                    <div className="text-sm">Hello! I'm here to help with your development tasks. What would you like to build today?</div>
                  </div>
                  <div className="bg-blue-600 text-white p-3 rounded-lg ml-8">
                    <div className="text-sm font-medium mb-1">You</div>
                    <div className="text-sm">I need a user authentication component with email/password login</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-600 mb-1">Claude</div>
                    <div className="text-sm">I'll create a secure authentication component for you. Let me generate the code and send it to Lovable for implementation.</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Ask Claude to help with development..." className="flex-1" />
                <Button>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-green-500" />
                  Git Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Current Branch</span>
                  <Badge variant="outline">main</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Commit</span>
                  <span className="text-sm text-gray-600">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">Up to date</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Pull Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Deployment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Production</span>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Staging</span>
                  <Badge className="bg-blue-100 text-blue-800">Building</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Deploy</span>
                  <span className="text-sm text-gray-600">1 hour ago</span>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
