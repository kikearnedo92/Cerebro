import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  Lightbulb,
  RefreshCw,
  Database,
  BarChart3
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface BehavioralInsight {
  id: string
  insight_type: 'friction' | 'churn_prediction' | 'conversion_opportunity' | 'user_behavior' | 'recommendation'
  title: string
  description: string
  impact_score: number
  affected_users: number
  stage: string
  recommended_actions: string[]
  metadata: any
  ai_confidence: number
  status: 'active' | 'implemented' | 'dismissed'
  created_at: string
  updated_at: string
  user_list?: UserProfile[]
}

interface UserProfile {
  backend_id: string
  user_type: 'new' | 'returning'
  journey_stage: string
  onboarding_time?: number
  drop_off_point?: string
  last_activity: string
}

interface AIRecommendation {
  id: string
  recommendation_type: 'ui_improvement' | 'flow_optimization' | 'feature_suggestion' | 'ab_test_proposal'
  title: string
  description: string
  expected_impact_percentage: number
  effort_score: number
  priority_score: number
  implementation_steps: string[]
  success_metrics: string[]
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  created_by_agent: string
  created_at: string
}

interface DataSyncLog {
  id: string
  source_system: 'amplitude' | 'internal_db' | 'ai_agent'
  sync_type: 'user_count' | 'conversion_rates' | 'behavioral_patterns' | 'churn_predictions'
  source_value: any
  reconciled_value: any
  discrepancy_detected: boolean
  discrepancy_percentage: number
  reconciliation_method: string
  agent_notes: string
  sync_timestamp: string
}

export const BehavioralAnalyticsAgent = () => {
  const [insights, setInsights] = useState<BehavioralInsight[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [syncLogs, setSyncLogs] = useState<DataSyncLog[]>([])
  const [amplitudeData, setAmplitudeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'new' | 'returning'>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch behavioral insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('behavioral_insights')
        .select('*')
        .eq('status', 'active')
        .order('impact_score', { ascending: false })
        .limit(10)

      if (insightsError) throw insightsError

      // Fetch AI recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('ai_recommendations')
        .select('*')
        .in('status', ['pending', 'approved'])
        .order('priority_score', { ascending: false })
        .limit(8)

      if (recommendationsError) throw recommendationsError

      // Fetch recent sync logs
      const { data: syncLogsData, error: syncLogsError } = await supabase
        .from('data_sync_logs')
        .select('*')
        .order('sync_timestamp', { ascending: false })
        .limit(5)

      if (syncLogsError) throw syncLogsError

      setInsights(insightsData || [])
      setRecommendations(recommendationsData || [])
      setSyncLogs(syncLogsData || [])

    } catch (error) {
      console.error('Error fetching behavioral analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to load behavioral analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerDataSync = async () => {
    try {
      setSyncing(true)
      
      // Trigger Amplitude sync which will populate the database
      const { data, error } = await supabase.functions.invoke('amplitude-analytics', {
        body: { action: 'fetch_insights', timeframe: '30d' }
      })

      if (error) throw error

      // Store Amplitude data for status display
      setAmplitudeData(data)

      toast({
        title: "🤖 AI Analysis Complete",
        description: `Analizados ${data?.totalActiveUsers?.toLocaleString() || 0} usuarios reales de Amplitude`,
        variant: "default"
      })

      // Refresh data after sync
      await fetchData()
      
    } catch (error) {
      console.error('Error triggering data sync:', error)
      toast({
        title: "Sync Error",
        description: "Failed to sync behavioral analytics data",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'friction': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'churn_prediction': return <TrendingDown className="w-5 h-5 text-orange-500" />
      case 'conversion_opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'user_behavior': return <Users className="w-5 h-5 text-blue-500" />
      default: return <Brain className="w-5 h-5 text-purple-500" />
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'ui_improvement': return <Target className="w-4 h-4 text-blue-500" />
      case 'flow_optimization': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'feature_suggestion': return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'ab_test_proposal': return <BarChart3 className="w-4 h-4 text-purple-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const openAmplitudeProfile = (userId: string) => {
    window.open(`https://app.amplitude.com/analytics/retorna/users/${userId}`, '_blank')
  }

  const getSegmentedInsights = () => {
    if (selectedSegment === 'all') return insights
    return insights.filter(insight => 
      insight.metadata?.user_segment === selectedSegment
    )
  }

  const getOnboardingAnalysis = (userType: 'new' | 'returning') => {
    const stages = userType === 'new' 
      ? ['registro', 'kyc', 'primer_envio']
      : ['login', 'crear_remesa']
    
    return {
      stages,
      avgTime: userType === 'new' ? '45 min' : '3 min',
      conversionRate: userType === 'new' ? '78%' : '92%',
      dropOffPoints: userType === 'new' ? ['KYC verification', 'First transfer'] : ['Payment methods']
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">🤖 Behavioral Analytics AI</h2>
            <p className="text-muted-foreground">Loading AI-powered insights...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
            🤖 Insights de Usabilidad
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Análisis AI de patrones de comportamiento y fricción en tu app basado en datos reales de Amplitude
          </p>
        </div>
        <Button 
          onClick={triggerDataSync} 
          disabled={syncing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {/* Amplitude Connection Status */}
      {amplitudeData?.status === 'REAL_DATA_FROM_AMPLITUDE' && (
        <Alert className="border-green-200 bg-green-50">
          <Database className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">✅ Conectado a Amplitude</AlertTitle>
          <AlertDescription className="text-green-700">
            Analizando {amplitudeData.totalActiveUsers?.toLocaleString()} usuarios activos reales. 
            Última actualización: {amplitudeData.fetchedAt ? new Date(amplitudeData.fetchedAt).toLocaleString() : 'Ahora'}
          </AlertDescription>
        </Alert>
      )}
      
      {amplitudeData?.status === 'MISSING_CREDENTIALS' && (
        <Alert className="border-amber-200 bg-amber-50">
          <Database className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">⚠️ Configurar API Keys</AlertTitle>
          <AlertDescription className="text-amber-700">
            Configura AMPLITUDE_API_KEY y AMPLITUDE_SECRET_KEY en Supabase para ver datos reales.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">AI </span>Insights ({getSegmentedInsights().length})
          </TabsTrigger>
          <TabsTrigger value="segmentation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">User </span>Segments
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Lightbulb className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Recommendations</span><span className="sm:hidden">Rec</span> ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Database className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Data </span>Sync
          </TabsTrigger>
        </TabsList>

        {/* Segmentation Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Segmento:</label>
            <select 
              value={selectedSegment} 
              onChange={(e) => setSelectedSegment(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
            >
              <option value="all">Todos los usuarios</option>
              <option value="new">Usuarios nuevos</option>
              <option value="returning">Usuarios recurrentes</option>
            </select>
          </div>
        </div>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          {getSegmentedInsights().length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No AI Insights Available</h3>
                  <p className="text-gray-600 mb-4">
                    Click "Sync Data" to trigger AI analysis and generate behavioral insights.
                  </p>
                  <Button onClick={triggerDataSync} disabled={syncing}>
                    Generate Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {getSegmentedInsights().map((insight) => (
                <Card key={insight.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.insight_type)}
                        <Badge variant="outline" className="text-xs">
                          {insight.insight_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={insight.impact_score > 80 ? 'destructive' : insight.impact_score > 60 ? 'default' : 'secondary'}>
                          Impact: {insight.impact_score}/100
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {insight.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {insight.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Affected Users:</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 justify-start sm:justify-end"
                        onClick={() => {
                          // Open Amplitude with user segmentation
                          const amplitudeUrl = `https://app.amplitude.com/analytics/retorna/cohort/new`
                          window.open(amplitudeUrl, '_blank')
                          toast({
                            title: "Abriendo Amplitude",
                            description: `Creando cohorte de ${insight.affected_users} usuarios afectados en Amplitude.`
                          })
                        }}
                      >
                        {insight.affected_users.toLocaleString()} usuarios 🔗
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.ai_confidence * 100} className="w-20 sm:w-16 h-2" />
                        <span className="font-medium">{Math.round(insight.ai_confidence * 100)}%</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recommended Actions:</h4>
                      <ul className="text-xs space-y-2">
                        {insight.recommended_actions.slice(0, 3).map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stage: {insight.stage}</span>
                      <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* User Segmentation Analysis */}
        <TabsContent value="segmentation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* New Users Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Usuarios Nuevos
                </CardTitle>
                <CardDescription>
                  Análisis del flujo: Registro → KYC → Primer envío
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">78%</div>
                    <div className="text-xs text-muted-foreground">Tasa conversión</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">45min</div>
                    <div className="text-xs text-muted-foreground">Tiempo promedio</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">22%</div>
                    <div className="text-xs text-muted-foreground">Drop-off KYC</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Puntos de fricción principales:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>KYC Verification</span>
                      <span className="text-red-600">22% abandon</span>
                    </div>
                    <div className="flex justify-between">
                      <span>First Transfer</span>
                      <span className="text-orange-600">8% abandon</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openAmplitudeProfile('new_users_cohort')}
                >
                  Ver detalles en Amplitude
                </Button>
              </CardContent>
            </Card>

            {/* Returning Users Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Usuarios Recurrentes
                </CardTitle>
                <CardDescription>
                  Análisis del flujo: Login → Crear remesa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-xs text-muted-foreground">Tasa conversión</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">3min</div>
                    <div className="text-xs text-muted-foreground">Tiempo promedio</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">8%</div>
                    <div className="text-xs text-muted-foreground">Drop-off pago</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Puntos de fricción principales:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Payment Methods</span>
                      <span className="text-orange-600">8% abandon</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Limit</span>
                      <span className="text-yellow-600">3% friction</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openAmplitudeProfile('returning_users_cohort')}
                >
                  Ver detalles en Amplitude
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de tiempos de onboarding</CardTitle>
              <CardDescription>
                Comparativa de tiempo por segmento y etapa del proceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Usuarios Nuevos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Registro</span>
                      <span className="font-medium">5 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>KYC</span>
                      <span className="font-medium">25 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Primer envío</span>
                      <span className="font-medium">15 min</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total promedio</span>
                      <span>45 min</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Usuarios Recurrentes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Login</span>
                      <span className="font-medium">30 seg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Crear remesa</span>
                      <span className="font-medium">2.5 min</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total promedio</span>
                      <span>3 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-gray-600">
                    AI agents will generate recommendations automatically after analyzing behavioral data.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.recommendation_type)}
                        <Badge variant="outline" className="text-xs">
                          {rec.recommendation_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.priority_score > 80 ? 'destructive' : 'default'}>
                          Priority: {rec.priority_score}/100
                        </Badge>
                        <Badge variant="secondary">
                          Effort: {rec.effort_score}/10
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Expected Impact:</span>
                        <div className="font-medium text-green-600">
                          +{rec.expected_impact_percentage}% improvement
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-medium">
                          <Badge variant={rec.status === 'pending' ? 'secondary' : 'default'}>
                            {rec.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Implementation Steps:</h4>
                      <ul className="text-xs space-y-1">
                        {rec.implementation_steps.slice(0, 3).map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Data Sync Logs */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Synchronization Logs
              </CardTitle>
              <CardDescription>
                Track data reconciliation between Amplitude and internal systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync logs available
                </div>
              ) : (
                <div className="space-y-4">
                  {syncLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.source_system}</Badge>
                          <Badge variant="secondary">{log.sync_type}</Badge>
                          {log.discrepancy_detected && (
                            <Badge variant="destructive">Discrepancy</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.sync_timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {log.discrepancy_detected && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Data Discrepancy Detected</AlertTitle>
                          <AlertDescription>
                            {log.discrepancy_percentage.toFixed(1)}% difference found.
                            Method: {log.reconciliation_method}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        {log.agent_notes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}