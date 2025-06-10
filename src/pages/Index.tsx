
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

    // Redirección basada en rol
    if (isSuperAdmin) {
      console.log('👑 Super admin detected, redirecting to tenants')
      navigate('/admin/tenants', { replace: true })
    } else if (isAdmin) {
      console.log('⚡ Admin detected, redirecting to knowledge')
      navigate('/knowledge', { replace: true })
    } else {
      console.log('👤 Regular user, redirecting to chat')
      navigate('/chat', { replace: true })
    }
  }, [user, loading, isSuperAdmin, isAdmin, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}

export default Index
