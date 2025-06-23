
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Code, 
  Eye, 
  GitBranch, 
  Lightbulb, 
  Play, 
  Target, 
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Plus
} from 'lucide-react'

interface RoadmapItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'planning' | 'development' | 'staging' | 'production' | 'completed'
  estimatedImpact: {
    conversion?: number
    retention?: number
    efficiency?: number
  }
  timeline: {
    startDate: string
    estimatedCompletion: string
  }
  assignedTo?: string
  previewUrl?: string
  stagingUsers?: string[]
  rolloutPercentage?: number
}

const mockRoadmapItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Optimizar flujo de registro KYC',
    description: 'Simplificar el proceso de verificación de identidad basado en quejas frecuentes',
    priority: 'high',
    status: 'development',
    estimatedImpact: {
      conversion: 15,
      efficiency: 25
    },
    timeline: {
      startDate: '2024-01-15',
      estimatedCompletion: '2024-02-01'
    },
    assignedTo: 'Equipo Frontend',
    previewUrl: 'https://preview.cerebro.app/kyc-v2',
    stagingUsers: ['user1@test.com', 'user2@test.com']
  },
  {
    id: '2',
    title: 'Mejorar onboarding de primera transferencia',
    description: 'Agregar tooltips y guías interactivas para reducir abandono',
    priority: 'medium',
    status: 'staging',
    estimatedImpact: {
      conversion: 12,
      retention: 18
    },
    timeline: {
      startDate: '2024-01-10',
      estimatedCompletion: '2024-01-25'
    },
    assignedTo: 'Equipo UX',
    rolloutPercentage: 10
  }
]

export const ImprovementRoadmap = () => {
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredItems = mockRoadmapItems.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'development': return 'bg-blue-100 text-blue-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      case 'production': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'planning': return 10
      case 'development': return 40
      case 'staging': return 70
      case 'production': return 90
      case 'completed': return 100
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Rocket className="h-6 w-6 text-purple-600 mr-2" />
            Roadmap de Mejoras
          </h2>
          <p className="text-muted-foreground">
            Mejoras generadas automáticamente desde Insights → AutoDev
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Mejora
        </Button>
      </div>

      {/* Filters */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="planning">Planificación</TabsTrigger>
          <TabsTrigger value="development">Desarrollo</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="production">Producción</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4">
          {/* Roadmap Items */}
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.assignedTo && (
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {item.assignedTo}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.previewUrl && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                          <Target className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{item.title}</DialogTitle>
                          <DialogDescription>{item.description}</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progreso</span>
                              <span>{getStatusProgress(item.status)}%</span>
                            </div>
                            <Progress value={getStatusProgress(item.status)} />
                          </div>

                          {/* Impact Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            {item.estimatedImpact.conversion && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  +{item.estimatedImpact.conversion}%
                                </div>
                                <div className="text-sm text-muted-foreground">Conversión</div>
                              </div>
                            )}
                            {item.estimatedImpact.retention && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  +{item.estimatedImpact.retention}%
                                </div>
                                <div className="text-sm text-muted-foreground">Retención</div>
                              </div>
                            )}
                            {item.estimatedImpact.efficiency && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  +{item.estimatedImpact.efficiency}%
                                </div>
                                <div className="text-sm text-muted-foreground">Eficiencia</div>
                              </div>
                            )}
                          </div>

                          {/* Timeline */}
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Inicio: {new Date(item.timeline.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Estimado: {new Date(item.timeline.estimatedCompletion).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Staging Users */}
                          {item.stagingUsers && (
                            <div>
                              <h4 className="font-semibold mb-2">Usuarios en Staging</h4>
                              <div className="space-y-1">
                                {item.stagingUsers.map((user, index) => (
                                  <Badge key={index} variant="secondary">
                                    {user}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rollout */}
                          {item.rolloutPercentage && (
                            <div>
                              <h4 className="font-semibold mb-2">Rollout en Producción</h4>
                              <div className="flex items-center space-x-2">
                                <Progress value={item.rolloutPercentage} className="flex-1" />
                                <span className="text-sm">{item.rolloutPercentage}%</span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button variant="outline">
                              <GitBranch className="h-4 w-4 mr-1" />
                              Ver Código
                            </Button>
                            <Button>
                              <Play className="h-4 w-4 mr-1" />
                              Avanzar a Siguiente Fase
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso</span>
                      <span>{getStatusProgress(item.status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(item.status)} />
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Impacto: {Object.values(item.estimatedImpact).reduce((a, b) => a + (b || 0), 0)}%
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(item.timeline.estimatedCompletion).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {item.rolloutPercentage && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {item.rolloutPercentage}% en producción
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
