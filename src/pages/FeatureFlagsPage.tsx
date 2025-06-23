
import React from 'react'
import { FeatureFlagsManager } from '@/components/admin/FeatureFlagsManager'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

const FeatureFlagsPage = () => {
  const { isSuperAdmin, profile } = useAuth()

  if (!isSuperAdmin && profile?.email !== 'eduardo@retorna.app') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
              <p className="text-gray-500">Solo super administradores pueden acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <FeatureFlagsManager />
    </div>
  )
}

export default FeatureFlagsPage
