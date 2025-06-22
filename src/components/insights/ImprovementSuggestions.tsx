
import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { ImprovementSuggestion } from '@/types/insights'
import { Lightbulb, TrendingUp, Users, DollarSign, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react'

interface ImprovementSuggestionsProps {
  data: ImprovementSuggestion[]
  onUpdateStatus: (id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected') => void
}

export const ImprovementSuggestions: React.FC<ImprovementSuggestionsProps> = ({ 
  data, 
  onUpdateStatus 
}) => {
  const analytics = useMemo(() => {
    // Sugerencias por categoría
    const categories = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Sugerencias por departamento responsable
    const departments = data.reduce((acc, item) => {
      if (item.department_owner) {
        acc[item.department_owner] = (acc[item.department_owner] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Análisis de impacto vs frecuencia (para priorización)
    const impactAnalysis = data.map(item => ({
      id: item.id,
      frequency: item.frequency_count,
      priority: item.priority_score,
      suggestion: item.suggestion_text.substring(0, 50) + '...',
      category: item.category,
      estimated_conversion: item.estimated_impact?.conversion_lift || 0,
      estimated_retention: item.estimated_impact?.retention_improvement || 0
    }))

    // Top sugerencias por prioridad
    const topSuggestions = data
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5)

    // Sugerencias pendientes de alta prioridad (score > 80)
    const urgentSuggestions = data.filter(item => 
      item.priority_score > 80 && item.implementation_status === 'pending'
    )

    return {
      categories: Object.entries(categories).map(([name, value]) => ({ name, value })),
      departments: Object.entries(departments).map(([name, value]) => ({ name, value })),
      impactAnalysis,
      topSuggestions,
      urgentSuggestions,
      totalSuggestions: data.length,
      completedSuggestions: data.filter(item => item.implementation_status === 'completed').length,
      avgPriorityScore: data.reduce((sum, item) => sum + item.priority_score, 0) / data.length
    }
  }, [data])

  const getCategoryIcon = (category: string) => {
    const icons = {
      'product': Target,
      'ux': Users,
      'fees': DollarSign,
      'speed': Clock,
      'support': Users
    }
    return icons[category as keyof typeof icons] || Lightbulb
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      'product': 'Producto',
      'ux': 'UX/UI',
      'fees': 'Fees',
      'speed': 'Velocidad',
      'support': 'Soporte'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getDepartmentLabel = (dept: string) => {
    const labels = {
      'product': 'Producto',
      'growth': 'Growth',
      'cs': 'Customer Success',
      'ops': 'Operaciones'
    }
    return labels[dept as keyof typeof labels] || dept
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'pending': return 'outline'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in_progress': return Clock
      case 'pending': return AlertCircle
      case 'rejected': return AlertCircle
      default: return AlertCircle
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Sugerencias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sugerencias</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSugerencias}</div>
            <p className="text-xs text-muted-foreground">
              Ideas de mejora identificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completedSuggestions}
            </div>
            <Progress 
              value={(analytics.completedSuggestions / analytics.totalSuggestions) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioridad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgPriorityScore.toFixed(0)}
            </div>
            <Progress value={analytics.avgPriorityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Escala 1-100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.urgentSuggestions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prioridad >80, pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sugerencias por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Sugerencias por Categoría</CardTitle>
            <CardDescription>
              Distribución de mejoras propuestas por área
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={getCategoryLabel}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={getCategoryLabel}
                  formatter={(value) => [value, 'Sugerencias']}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análisis Impacto vs Frecuencia */}
        <Card>
          <CardHeader>
            <CardTitle>Impacto vs Frecuencia</CardTitle>
            <CardDescription>
              Priorización basada en frecuencia de solicitud y puntaje de prioridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analytics.impactAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="frequency" 
                  type="number" 
                  name="Frecuencia"
                  label={{ value: 'Frecuencia de Solicitud', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="priority" 
                  type="number" 
                  name="Prioridad"
                  label={{ value: 'Puntaje de Prioridad', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{data.suggestion}</p>
                          <p>Frecuencia: {data.frequency}</p>
                          <p>Prioridad: {data.priority}</p>
                          <p>Categoría: {getCategoryLabel(data.category)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter dataKey="priority" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detallada de Sugerencias */}
      <Card>
        <CardHeader>
          <CardTitle>Sugerencias Detalladas - Por Prioridad</CardTitle>
          <CardDescription>
            Listado completo de mejoras sugeridas ordenadas por impacto potencial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topSuggestions.map((suggestion, index) => {
              const CategoryIcon = getCategoryIcon(suggestion.category)
              const StatusIcon = getStatusIcon(suggestion.implementation_status)
              
              return (
                <div 
                  key={suggestion.id} 
                  className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <CategoryIcon className="h-5 w-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{suggestion.suggestion_text}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">
                            {getCategoryLabel(suggestion.category)}
                          </Badge>
                          {suggestion.department_owner && (
                            <Badge variant="secondary">
                              {getDepartmentLabel(suggestion.department_owner)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm">
                        <div className="font-semibold text-lg">{suggestion.priority_score}</div>
                        <div className="text-gray-500">Prioridad</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Frecuencia:</span>
                      <div className="font-semibold">{suggestion.frequency_count} veces</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Impacto área:</span>
                      <div className="font-semibold capitalize">{suggestion.impact_area}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Primera mención:</span>
                      <div className="font-semibold">
                        {new Date(suggestion.first_mentioned).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Última mención:</span>
                      <div className="font-semibold">
                        {new Date(suggestion.last_mentioned).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {suggestion.estimated_impact && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <span className="text-sm font-medium">Impacto estimado:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-sm">
                        {suggestion.estimated_impact.conversion_lift && (
                          <div>
                            Conversión: <strong>+{(suggestion.estimated_impact.conversion_lift * 100).toFixed(1)}%</strong>
                          </div>
                        )}
                        {suggestion.estimated_impact.retention_improvement && (
                          <div>
                            Retención: <strong>+{(suggestion.estimated_impact.retention_improvement * 100).toFixed(1)}%</strong>
                          </div>
                        )}
                        {suggestion.estimated_impact.cost_reduction && (
                          <div>
                            Reducción costos: <strong>-{(suggestion.estimated_impact.cost_reduction * 100).toFixed(1)}%</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={getStatusColor(suggestion.implementation_status)}>
                        {suggestion.implementation_status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Select
                        value={suggestion.implementation_status}
                        onValueChange={(value) => onUpdateStatus(suggestion.id, value as any)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">En Progreso</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
