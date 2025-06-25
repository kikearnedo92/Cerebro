
import React from 'react'
import { useEnhancedFeatureFlags } from '@/hooks/useEnhancedFeatureFlags'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Crown } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  featureFlag: string
  fallbackTitle?: string
  fallbackMessage?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  featureFlag, 
  fallbackTitle = "Función no disponible",
  fallbackMessage = "Esta función no está habilitada para tu plan actual."
}) => {
  const { hasFeatureAccess, loading } = useEnhancedFeatureFlags()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!hasFeatureAccess(featureFlag)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{fallbackTitle}</h3>
              <p className="text-gray-500">{fallbackMessage}</p>
              <p className="text-sm text-gray-400 mt-2">
                Contacta al administrador para habilitar esta funcionalidad.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
