
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const amplitudeApiKey = Deno.env.get('AMPLITUDE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, timeframe = '30d', user_id } = await req.json();
    
    console.log(`📊 Amplitude analytics action: ${action}`);
    
    if (!amplitudeApiKey) {
      throw new Error('Amplitude API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'fetch_insights') {
      console.log('🔍 Fetching Amplitude insights...');
      
      // Fetch user journey events from Amplitude
      const userJourneys = await fetchUserJourneyData(timeframe);
      const insights = await generateUsabilityInsights(userJourneys);
      const conversionRates = await calculateConversionRates(userJourneys);
      const churnPredictions = await predictChurnFromUsability(userJourneys);
      
      // Calculate average time in stages
      const averageTimeInStages = calculateAverageTimeInStages(userJourneys);
      
      const dashboardData = {
        userJourneys,
        insights,
        conversionRates,
        averageTimeInStages,
        churnPredictions
      };
      
      // Store insights in our database for historical tracking
      await storeInsights(supabase, insights);
      
      return new Response(JSON.stringify(dashboardData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync_events') {
      console.log('🔄 Syncing Amplitude events...');
      
      // Fetch recent events from Amplitude
      const events = await fetchAmplitudeEvents(timeframe);
      
      // Process and store events for analysis
      let processedEvents = 0;
      
      for (const event of events) {
        try {
          await processAmplitudeEvent(supabase, event);
          processedEvents++;
        } catch (eventError) {
          console.error('Error processing event:', eventError);
        }
      }
      
      console.log(`✅ Processed ${processedEvents} Amplitude events`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        events_processed: processedEvents 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze_user_journey') {
      console.log(`👤 Analyzing user journey for: ${user_id}`);
      
      const userJourney = await analyzeSpecificUserJourney(user_id);
      
      return new Response(JSON.stringify(userJourney), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('❌ Amplitude analytics error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Analytics processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchUserJourneyData(timeframe: string) {
  // Mock data for now - replace with actual Amplitude API calls
  console.log(`📈 Fetching user journey data for ${timeframe}`);
  
  // This would be replaced with actual Amplitude API calls
  const mockJourneys = [
    {
      user_id: 'user_001',
      stage: 'registration',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      time_in_stage: 5,
      completion_rate: 0.85,
      friction_points: ['email_verification_delay']
    },
    {
      user_id: 'user_001',
      stage: 'kyc_start',
      timestamp: new Date(Date.now() - 82800000).toISOString(),
      time_in_stage: 15,
      completion_rate: 0.72,
      friction_points: ['document_upload_failed', 'unclear_instructions']
    },
    {
      user_id: 'user_002',
      stage: 'registration',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      time_in_stage: 3,
      completion_rate: 0.95,
      friction_points: []
    }
  ];
  
  return mockJourneys;
}

async function generateUsabilityInsights(userJourneys: any[]) {
  console.log('🧠 Generating usability insights...');
  
  const insights = [];
  
  // Analyze friction points
  const frictionPoints = userJourneys
    .flatMap(journey => journey.friction_points)
    .reduce((acc, point) => {
      acc[point] = (acc[point] || 0) + 1;
      return acc;
    }, {});
  
  // Generate insights based on friction analysis
  for (const [point, count] of Object.entries(frictionPoints)) {
    if (count > 2) { // Threshold for significant friction
      insights.push({
        insight_type: 'friction',
        title: `Punto de fricción crítico: ${point}`,
        description: `${count} usuarios experimentaron problemas con ${point}. Esto puede estar afectando la conversión.`,
        impact_score: count * 10,
        affected_users: count,
        stage: getStageFromFrictionPoint(point),
        recommended_actions: getRecommendedActions(point),
        created_at: new Date().toISOString()
      });
    }
  }
  
  // Analyze conversion rates by stage
  const stageConversions = analyzeStageConversions(userJourneys);
  
  for (const [stage, rate] of Object.entries(stageConversions)) {
    if (rate < 0.7) { // Low conversion threshold
      insights.push({
        insight_type: 'onboarding_optimization',
        title: `Baja conversión en ${stage}`,
        description: `La tasa de conversión en ${stage} es del ${(rate * 100).toFixed(1)}%, por debajo del objetivo del 70%.`,
        impact_score: (0.7 - rate) * 100,
        affected_users: Math.floor(userJourneys.length * (1 - rate)),
        stage,
        recommended_actions: getStageOptimizationActions(stage),
        created_at: new Date().toISOString()
      });
    }
  }
  
  return insights;
}

async function calculateConversionRates(userJourneys: any[]) {
  const stages = ['registration', 'kyc_start', 'kyc_complete', 'first_transfer', 'repeat_user'];
  const conversions = {};
  
  for (let i = 0; i < stages.length - 1; i++) {
    const currentStage = stages[i];
    const nextStage = stages[i + 1];
    
    const currentStageUsers = userJourneys.filter(j => j.stage === currentStage).length;
    const nextStageUsers = userJourneys.filter(j => j.stage === nextStage).length;
    
    const rate = currentStageUsers > 0 ? nextStageUsers / currentStageUsers : 0;
    conversions[`${currentStage}_to_${nextStage}`] = rate;
  }
  
  return {
    registration_to_kyc: conversions.registration_to_kyc_start || 0.75,
    kyc_to_first_transfer: conversions.kyc_complete_to_first_transfer || 0.68,
    first_to_repeat_transfer: conversions.first_transfer_to_repeat_user || 0.45
  };
}

async function predictChurnFromUsability(userJourneys: any[]) {
  // Analyze patterns that indicate high churn risk
  const highRiskIndicators = [
    'document_upload_failed',
    'unclear_instructions',
    'long_verification_time',
    'multiple_failed_attempts'
  ];
  
  const highRiskUsers = userJourneys.filter(journey => 
    journey.friction_points.some(point => highRiskIndicators.includes(point)) ||
    journey.time_in_stage > 30 || // More than 30 minutes in a stage
    journey.completion_rate < 0.5
  ).length;
  
  const totalUsers = new Set(userJourneys.map(j => j.user_id)).size;
  const predictedChurnRate = totalUsers > 0 ? highRiskUsers / totalUsers : 0;
  
  // Analyze top churn reasons
  const churnReasons = userJourneys
    .filter(j => j.completion_rate < 0.5)
    .flatMap(j => j.friction_points)
    .reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
  
  const topChurnReasons = Object.entries(churnReasons)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([reason]) => reason);
  
  return {
    high_risk_users: highRiskUsers,
    predicted_churn_rate: predictedChurnRate,
    top_churn_reasons: topChurnReasons
  };
}

function calculateAverageTimeInStages(userJourneys: any[]) {
  const stagesTimes = userJourneys.reduce((acc, journey) => {
    if (!acc[journey.stage]) {
      acc[journey.stage] = [];
    }
    acc[journey.stage].push(journey.time_in_stage);
    return acc;
  }, {});
  
  const averages = {};
  for (const [stage, times] of Object.entries(stagesTimes)) {
    averages[stage] = times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  return {
    kyc_completion: averages.kyc_start || 20,
    first_transfer: averages.first_transfer || 8
  };
}

async function fetchAmplitudeEvents(timeframe: string) {
  // This would make actual API calls to Amplitude
  console.log(`📡 Fetching Amplitude events for ${timeframe}`);
  
  // Mock events for now
  return [
    {
      event_type: 'Page View',
      user_id: 'user_001',
      timestamp: Date.now() - 3600000,
      event_properties: {
        page: '/kyc',
        time_on_page: 120
      }
    }
  ];
}

async function processAmplitudeEvent(supabase: any, event: any) {
  // Process and store Amplitude events for analysis
  await supabase
    .from('amplitude_events')
    .upsert({
      event_type: event.event_type,
      user_id: event.user_id,
      timestamp: new Date(event.timestamp).toISOString(),
      properties: event.event_properties
    });
}

async function analyzeSpecificUserJourney(userId: string) {
  console.log(`🔍 Analyzing journey for user: ${userId}`);
  
  // This would fetch and analyze specific user's journey
  return {
    user_id: userId,
    stages_completed: ['registration', 'kyc_start'],
    current_stage: 'kyc_start',
    friction_points: ['document_upload_failed'],
    predicted_churn_risk: 0.75,
    recommendations: ['Simplify document upload process', 'Add progress indicators']
  };
}

async function storeInsights(supabase: any, insights: any[]) {
  for (const insight of insights) {
    await supabase
      .from('amplitude_insights')
      .upsert(insight);
  }
}

function getStageFromFrictionPoint(point: string): string {
  const stageMap = {
    'email_verification_delay': 'registration',
    'document_upload_failed': 'kyc_start',
    'unclear_instructions': 'kyc_start',
    'long_verification_time': 'kyc_complete'
  };
  return stageMap[point] || 'unknown';
}

function getRecommendedActions(frictionPoint: string): string[] {
  const actionMap = {
    'email_verification_delay': [
      'Implementar verificación de email más rápida',
      'Agregar opción de reenvío de email',
      'Mostrar mensajes de estado claros'
    ],
    'document_upload_failed': [
      'Mejorar la funcionalidad de subida de documentos',
      'Agregar validación en tiempo real',
      'Proporcionar formatos de ejemplo'
    ],
    'unclear_instructions': [
      'Revisar y simplificar las instrucciones',
      'Agregar videos explicativos',
      'Implementar tooltips contextuales'
    ]
  };
  return actionMap[frictionPoint] || ['Investigar y optimizar este punto de fricción'];
}

function analyzeStageConversions(userJourneys: any[]) {
  // Mock conversion analysis
  return {
    'registration': 0.85,
    'kyc_start': 0.72,
    'kyc_complete': 0.68,
    'first_transfer': 0.45
  };
}

function getStageOptimizationActions(stage: string): string[] {
  const optimizationMap = {
    'registration': [
      'Simplificar el formulario de registro',
      'Implementar registro social',
      'Optimizar para mobile'
    ],
    'kyc_start': [
      'Mejorar el flujo de KYC',
      'Agregar indicadores de progreso',
      'Optimizar la subida de documentos'
    ],
    'first_transfer': [
      'Simplificar el proceso de transferencia',
      'Agregar tutoriales interactivos',
      'Ofrecer incentivos para la primera transferencia'
    ]
  };
  return optimizationMap[stage] || ['Analizar y optimizar esta etapa'];
}
