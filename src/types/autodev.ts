
export interface CodeGeneration {
  id: string
  title: string
  description: string
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'deployed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_impact: {
    conversion_lift?: number
    retention_improvement?: number
    performance_gain?: number
    cost_reduction?: number
  }
  trigger_source: 'insights' | 'manual' | 'automated'
  spec_generated_by: 'claude' | 'manual'
  code_generated_by: 'lovable' | 'manus' | 'manual'
  target_component: string
  repository_url?: string
  pull_request_url?: string
  deployment_url?: string
  test_results?: {
    passed: number
    failed: number
    coverage: number
  }
  performance_metrics?: {
    before: any
    after: any
  }
  created_at: string
  updated_at: string
  deployed_at?: string
}

export interface AutomationPipeline {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'disabled'
  trigger_conditions: {
    insight_threshold?: number
    frequency_threshold?: number
    priority_threshold?: number
    auto_execute?: boolean
  }
  steps: PipelineStep[]
  success_rate: number
  total_executions: number
  last_execution?: string
  created_at: string
  updated_at: string
}

export interface PipelineStep {
  id: string
  name: string
  type: 'analysis' | 'generation' | 'testing' | 'deployment' | 'rollback'
  service: 'claude' | 'lovable' | 'manus' | 'github' | 'vercel'
  config: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
  error_message?: string
}

export interface AutoDevDashboardData {
  codeGenerations: CodeGeneration[]
  automationPipelines: AutomationPipeline[]
  totalGenerations: number
  successfulDeployments: number
  avgImpactScore: number
  activeAutomations: number
  queuedTasks: number
}

export interface APIIntegration {
  id: string
  name: string
  type: 'claude' | 'lovable' | 'manus' | 'github' | 'vercel'
  status: 'connected' | 'disconnected' | 'error'
  api_key?: string
  config: any
  last_used?: string
  usage_count: number
  error_count: number
  success_rate: number
}
