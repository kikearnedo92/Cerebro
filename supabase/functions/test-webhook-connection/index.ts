
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { webhookUrl, apiKey } = await req.json()
    
    console.log('🔗 Testing webhook connection to:', webhookUrl)

    // Send test payload to webhook
    const testPayload = {
      event: 'connection_test',
      timestamp: new Date().toISOString(),
      source: 'nucleo_autodev',
      message: 'This is a test connection from NÚCLEO AutoDev'
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'NUCLEO-AutoDev/1.0'
      },
      body: JSON.stringify(testPayload)
    })

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`)
    }

    console.log('✅ Webhook connection successful')

    return new Response(
      JSON.stringify({ 
        success: true,
        status: response.status,
        message: 'Webhook connection established successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Webhook connection test failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
