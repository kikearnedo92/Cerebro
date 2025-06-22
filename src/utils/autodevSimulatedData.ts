
import { CodeGeneration, AutomationPipeline, AutoDevDashboardData, APIIntegration } from '@/types/autodev'

export const simulatedCodeGenerations: CodeGeneration[] = [
  {
    id: 'cg-001',
    title: 'Optimización del formulario de KYC',
    description: 'Mejora automática del formulario de verificación de identidad basada en análisis de abandono',
    status: 'completed',
    priority: 'high',
    estimated_impact: {
      conversion_lift: 0.15,
      retention_improvement: 0.08
    },
    trigger_source: 'insights',
    spec_generated_by: 'claude',
    code_generated_by: 'lovable',
    target_component: 'KYCForm.tsx',
    repository_url: 'https://github.com/retorna/cerebro',
    pull_request_url: 'https://github.com/retorna/cerebro/pull/123',
    deployment_url: 'https://cerebro-staging.vercel.app',
    test_results: {
      passed: 24,
      failed: 1,
      coverage: 89
    },
    performance_metrics: {
      before: { conversion_rate: 0.67, abandonment_rate: 0.33 },
      after: { conversion_rate: 0.82, abandonment_rate: 0.18 }
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:45:00Z',
    deployed_at: '2024-01-15T15:00:00Z'
  },
  {
    id: 'cg-002',
    title: 'Rediseño del selector de países',
    description: 'Interfaz más intuitiva para selección de país de destino en transferencias',
    status: 'generating',
    priority: 'medium',
    estimated_impact: {
      conversion_lift: 0.08,
      performance_gain: 0.12
    },
    trigger_source: 'insights',
    spec_generated_by: 'claude',
    code_generated_by: 'lovable',
    target_component: 'CountrySelector.tsx',
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T11:30:00Z'
  },
  {
    id: 'cg-003',
    title: 'Implementación de calculadora de fees transparente',
    description: 'Widget interactivo que muestra el desglose completo de costos antes de la transferencia',
    status: 'pending',
    priority: 'critical',
    estimated_impact: {
      conversion_lift: 0.22,
      retention_improvement: 0.18,
      cost_reduction: 0.05
    },
    trigger_source: 'insights',
    spec_generated_by: 'claude',
    code_generated_by: 'lovable',
    target_component: 'FeeCalculator.tsx',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 'cg-004',
    title: 'Optimización de la página de confirmación',
    description: 'Reducción de fricción en el último paso del proceso de transferencia',
    status: 'failed',
    priority: 'high',
    estimated_impact: {
      conversion_lift: 0.12,
      retention_improvement: 0.06
    },
    trigger_source: 'automated',
    spec_generated_by: 'claude',
    code_generated_by: 'manus',
    target_component: 'ConfirmationPage.tsx',
    created_at: '2024-01-14T16:45:00Z',
    updated_at: '2024-01-14T18:30:00Z'
  },
  {
    id: 'cg-005',
    title: 'Sistema de notificaciones push mejorado',
    description: 'Notificaciones contextuales sobre el estado de transferencias',
    status: 'deployed',
    priority: 'medium',
    estimated_impact: {
      retention_improvement: 0.14,
      performance_gain: 0.09
    },
    trigger_source: 'manual',
    spec_generated_by: 'manual',
    code_generated_by: 'lovable',
    target_component: 'NotificationSystem.tsx',
    repository_url: 'https://github.com/retorna/cerebro',
    pull_request_url: 'https://github.com/retorna/cerebro/pull/121',
    deployment_url: 'https://retorna.com',
    test_results: {
      passed: 18,
      failed: 0,
      coverage: 94
    },
    created_at: '2024-01-12T11:20:00Z',
    updated_at: '2024-01-13T16:15:00Z',
    deployed_at: '2024-01-13T17:00:00Z'
  }
]

export const simulatedAutomationPipelines: AutomationPipeline[] = [
  {
    id: 'ap-001',
    name: 'Pipeline de Mejoras de Conversión',
    description: 'Automatización completa para mejoras que impacten la conversión de nuevos usuarios',
    status: 'active',
    trigger_conditions: {
      insight_threshold: 80,
      frequency_threshold: 5,
      priority_threshold: 70,
      auto_execute: true
    },
    steps: [
      {
        id: 'step-001',
        name: 'Análisis con Claude',
        type: 'analysis',
        service: 'claude',
        config: { model: 'claude-3-opus', max_tokens: 4000 },
        status: 'completed',
        duration: 45
      },
      {
        id: 'step-002',
        name: 'Generación de código',
        type: 'generation',
        service: 'lovable',
        config: { framework: 'react', typescript: true },
        status: 'running',
        duration: 120
      },
      {
        id: 'step-003',
        name: 'Testing automatizado',
        type: 'testing',
        service: 'github',
        config: { run_tests: true, coverage_threshold: 80 },
        status: 'pending'
      },
      {
        id: 'step-004',
        name: 'Deploy a producción',
        type: 'deployment',
        service: 'vercel',
        config: { environment: 'production', rollback_enabled: true },
        status: 'pending'
      }
    ],
    success_rate: 87.5,
    total_executions: 8,
    last_execution: '2024-01-16T11:30:00Z',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-16T11:30:00Z'
  },
  {
    id: 'ap-002',
    name: 'Pipeline de Optimización de Performance',
    description: 'Mejoras automáticas de rendimiento y velocidad de la aplicación',
    status: 'active',
    trigger_conditions: {
      insight_threshold: 60,
      frequency_threshold: 3,
      priority_threshold: 50,
      auto_execute: false
    },
    steps: [
      {
        id: 'step-005',
        name: 'Análisis de performance',
        type: 'analysis',
        service: 'claude',
        config: { focus: 'performance', analyze_metrics: true },
        status: 'completed',
        duration: 30
      },
      {
        id: 'step-006',
        name: 'Optimización automática',
        type: 'generation',
        service: 'manus',
        config: { optimization_type: 'performance' },
        status: 'completed',
        duration: 180
      },
      {
        id: 'step-007',
        name: 'Testing de performance',
        type: 'testing',
        service: 'github',
        config: { performance_tests: true },
        status: 'completed',
        duration: 90
      }
    ],
    success_rate: 92.3,
    total_executions: 13,
    last_execution: '2024-01-15T08:45:00Z',
    created_at: '2024-01-08T14:30:00Z',
    updated_at: '2024-01-15T08:45:00Z'
  },
  {
    id: 'ap-003',
    name: 'Pipeline de Mejoras UX Críticas',
    description: 'Automatización para cambios críticos de experiencia de usuario',
    status: 'paused',
    trigger_conditions: {
      insight_threshold: 90,
      frequency_threshold: 8,
      priority_threshold: 85,
      auto_execute: false
    },
    steps: [
      {
        id: 'step-008',
        name: 'Análisis UX profundo',
        type: 'analysis',
        service: 'claude',
        config: { focus: 'ux', user_research: true },
        status: 'pending'
      },
      {
        id: 'step-009',
        name: 'Prototipado automático',
        type: 'generation',
        service: 'lovable',
        config: { create_prototypes: true },
        status: 'pending'
      }
    ],
    success_rate: 76.9,
    total_executions: 26,
    last_execution: '2024-01-12T15:20:00Z',
    created_at: '2024-01-05T10:15:00Z',
    updated_at: '2024-01-12T15:20:00Z'
  }
]

export const simulatedAPIIntegrations: APIIntegration[] = [
  {
    id: 'api-001',
    name: 'Claude API',
    type: 'claude',
    status: 'connected',
    config: {
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.3
    },
    last_used: '2024-01-16T11:30:00Z',
    usage_count: 156,
    error_count: 3,
    success_rate: 98.1
  },
  {
    id: 'api-002',
    name: 'Lovable API',
    type: 'lovable',
    status: 'connected',
    config: {
      framework: 'react',
      typescript: true,
      styling: 'tailwind'
    },
    last_used: '2024-01-16T10:15:00Z',
    usage_count: 89,
    error_count: 7,
    success_rate: 92.1
  },
  {
    id: 'api-003',
    name: 'Magnus/Manus API',
    type: 'manus',
    status: 'error',
    config: {
      automation_level: 'advanced',
      safety_checks: true
    },
    last_used: '2024-01-14T18:30:00Z',
    usage_count: 23,
    error_count: 12,
    success_rate: 47.8
  },
  {
    id: 'api-004',
    name: 'GitHub API',
    type: 'github',
    status: 'connected',
    config: {
      repository: 'retorna/cerebro',
      branch: 'main',
      auto_merge: false
    },
    last_used: '2024-01-15T15:00:00Z',
    usage_count: 67,
    error_count: 2,
    success_rate: 97.0
  },
  {
    id: 'api-005',
    name: 'Vercel API',
    type: 'vercel',
    status: 'connected',
    config: {
      project: 'cerebro',
      environment: 'production',
      auto_deploy: true
    },
    last_used: '2024-01-15T17:00:00Z',
    usage_count: 34,
    error_count: 1,
    success_rate: 97.1
  }
]

export const generateAutoDevMetrics = (): Omit<AutoDevDashboardData, 'codeGenerations' | 'automationPipelines'> => {
  return {
    totalGenerations: simulatedCodeGenerations.length,
    successfulDeployments: simulatedCodeGenerations.filter(cg => cg.status === 'deployed').length,
    avgImpactScore: simulatedCodeGenerations.reduce((sum, cg) => {
      const impact = (cg.estimated_impact.conversion_lift || 0) + 
                    (cg.estimated_impact.retention_improvement || 0) + 
                    (cg.estimated_impact.performance_gain || 0)
      return sum + impact
    }, 0) / simulatedCodeGenerations.length * 100,
    activeAutomations: simulatedAutomationPipelines.filter(ap => ap.status === 'active').length,
    queuedTasks: simulatedCodeGenerations.filter(cg => cg.status === 'pending').length
  }
}
