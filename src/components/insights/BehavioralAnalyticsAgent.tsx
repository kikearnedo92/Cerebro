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
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

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

      toast({
        title: "🤖 AI Analysis Complete",
        description: "Behavioral patterns detected and synced to database",
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" />
            🤖 Behavioral Analytics AI
          </h2>
          <p className="text-muted-foreground">
            AI agents monitoring user behavior and generating automatic insights
          </p>
        </div>
        <Button 
          onClick={triggerDataSync} 
          disabled={syncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {/* Status Alert */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Data Sync Status</AlertTitle>
        <AlertDescription>
          Last sync: {syncLogs[0]?.sync_timestamp ? new Date(syncLogs[0].sync_timestamp).toLocaleString() : 'Never'}
          {syncLogs.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {syncLogs.filter(log => log.discrepancy_detected).length} discrepancies detected
            </Badge>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            AI Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Sync
          </TabsTrigger>
        </TabsList>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
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
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
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
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Affected Users:</span>
                      <span className="font-medium">{insight.affected_users.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.ai_confidence * 100} className="w-16 h-2" />
                        <span className="font-medium">{Math.round(insight.ai_confidence * 100)}%</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recommended Actions:</h4>
                      <ul className="text-xs space-y-1">
                        {insight.recommended_actions.slice(0, 3).map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {action}
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