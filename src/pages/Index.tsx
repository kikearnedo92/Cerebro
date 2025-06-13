import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const Index = () => {
  const { user, loading, isSuperAdmin, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔍 Index page - Auth state:', { user: !!user, loading, isSuperAdmin, isAdmin })
    
    if (loading) {
      console.log('⏳ Still loading auth...')
      return
    }

    if (!user) {
      console.log('🚫 No user, redirecting to landing')
      navigate('/landing', { replace: true })
      return
    }

    // Keep user on chat by default
    console.log('👤 User authenticated, redirecting to chat')
    navigate('/chat', { replace: true })
  }, [user, loading, isSuperAdmin, isAdmin, navigate])

  // Show loading while resolving redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}

export default Index
