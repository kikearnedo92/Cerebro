
import React from 'react'
import { FeatureFlagsManager } from '@/components/admin/FeatureFlagsManager'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

const FeatureFlagsPage = () => {
  const { user, profile } = useAuth()

  // Enhanced super admin check
  const isSuperAdmin = profile?.is_super_admin || 
                      profile?.email === 'eduardo@retorna.app' ||
                      profile?.role_system === 'super_admin'

  console.log('🔐 FeatureFlagsPage - User:', user?.email)
  console.log('🔐 FeatureFlagsPage - Profile:', profile)
  console.log('🔐 FeatureFlagsPage - Is Super Admin:', isSuperAdmin)

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Autenticación Requerida</h3>
              <p className="text-gray-500">Debes iniciar sesión para acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
              <p className="text-gray-500">Solo super administradores pueden acceder a esta página.</p>
              <p className="text-xs text-gray-400 mt-2">Usuario: {user.email}</p>
              <p className="text-xs text-gray-400">Rol: {profile?.role_system || 'No asignado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Acceso autorizado como Super Admin: {user.email}
        </p>
      </div>
      <FeatureFlagsManager />
    </div>
  )
}

export default FeatureFlagsPage
