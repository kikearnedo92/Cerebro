
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
    const { repositoryUrl } = await req.json()
    
    console.log('🔗 Testing GitHub connection for:', repositoryUrl)

    // Extract owner and repo from URL
    const urlParts = repositoryUrl.replace('https://github.com/', '').split('/')
    const [owner, repo] = urlParts

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL format')
    }

    // Test GitHub API access
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NUCLEO-AutoDev'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found or private')
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repoData = await response.json()
    
    console.log('✅ GitHub connection successful:', repoData.full_name)

    return new Response(
      JSON.stringify({ 
        success: true,
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stargazers_count
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ GitHub connection test failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
