
// ARCHIVO ELIMINADO - NO MAS DATA FAKE
// Todo debe usar datos reales de Amplitude y Supabase

export const simulatedConversationAnalytics = []
export const simulatedChurnPredictions = []
export const simulatedImprovementSuggestions = []

export const generateSimulatedMetrics = () => {
  console.warn('❌ NO MORE FAKE DATA - Use real Amplitude data')
  return {
    totalUsers: 0,
    activeUsers: 0,
    supportTickets: 0,
    avgResolutionTime: 0,
    weeklyGrowth: 0,
    churnRate: 0,
    npsScore: 0,
    conversionRate: 0,
    avgTransferAmount: 0,
    topDestinations: []
  }
}
