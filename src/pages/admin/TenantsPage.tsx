import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Database, Settings, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const TenantsPage = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const isSuperAdmin = profile?.is_super_admin || profile?.role_system === 'super_admin'

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-gray-500">Solo super administradores pueden acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Tenants</h1>
          <p className="text-gray-600">Administra organizaciones y configuraciones</p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Super Admin
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Configuraciones</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analytics</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Principal - Retorna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado</span>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Plan</span>
              <Badge variant="outline">Enterprise</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Usuarios</span>
              <span className="text-sm">5 / Ilimitado</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-sm">2.3 GB / Ilimitado</span>
            </div>
            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate('/cerebro/settings')}
                className="w-full"
              >
                Configurar Tenant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TenantsPage