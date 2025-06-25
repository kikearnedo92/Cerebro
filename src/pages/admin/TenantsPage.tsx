
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Users, Crown, Settings, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEnhancedFeatureFlags } from '@/hooks/useEnhancedFeatureFlags'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const TenantsPage = () => {
  const { isSuperAdmin, profile } = useAuth()
  const { availableFeatures, loadConfiguration } = useEnhancedFeatureFlags()
  const [loading, setLoading] = useState(false)

  if (!isSuperAdmin && profile?.email !== 'eduardo@retorna.app') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
              <p className="text-gray-500">Solo super administradores pueden acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Enhanced mock data with product configurations
  const tenants = [
    {
      id: '1',
      name: 'Retorna',
      subdomain: 'retorna',
      plan: 'internal',
      status: 'active',
      users: 25,
      isInternal: true,
      product: 'cerebro',
      productName: 'Cerebro'
    },
    {
      id: '2', 
      name: 'Demo',
      subdomain: 'demo',
      plan: 'starter',
      status: 'trial',
      users: 5,
      isInternal: false,
      product: 'nucleo',
      productName: 'Núcleo'
    }
  ]

  const handleProductChange = async (tenantId: string, productName: string) => {
    setLoading(true)
    try {
      // In a real implementation, this would update the tenant's product
      toast({
        title: "Producto actualizado",
        description: `Tenant cambiado a ${productName === 'cerebro' ? 'Cerebro' : 'Núcleo'}`
      })
      await loadConfiguration()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'internal':
        return 'bg-purple-100 text-purple-800'
      case 'starter':
        return 'bg-green-100 text-green-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProductColor = (product: string) => {
    return product === 'cerebro' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Gestión de Tenants y Productos
          </h1>
          <p className="text-gray-600">Administra organizaciones, productos y configuraciones de features</p>
        </div>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-lg font-bold">{tenants.length}</p>
                    <p className="text-sm text-gray-600">Total Tenants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-lg font-bold">
                      {tenants.reduce((sum, tenant) => sum + tenant.users, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Usuarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold">
                      {tenants.filter(t => t.product === 'cerebro').length}
                    </p>
                    <p className="text-sm text-gray-600">Cerebro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-lg font-bold">
                      {tenants.filter(t => t.product === 'nucleo').length}
                    </p>
                    <p className="text-sm text-gray-600">Núcleo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenants List */}
          <Card>
            <CardHeader>
              <CardTitle>Organizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">{tenant.subdomain}.cerebro.app</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs text-gray-500">Producto</label>
                        <Select 
                          value={tenant.product} 
                          onValueChange={(value) => handleProductChange(tenant.id, value)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cerebro">Cerebro</SelectItem>
                            <SelectItem value="nucleo">Núcleo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Badge className={getProductColor(tenant.product)}>
                        {tenant.productName}
                      </Badge>
                      <Badge className={getPlanColor(tenant.plan)}>
                        {tenant.plan}
                      </Badge>
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {tenant.users} usuarios
                      </div>
                      {tenant.isInternal && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          Interno
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['memory', 'insights', 'launch', 'build', 'admin'].map((module) => {
                  const moduleFeatures = availableFeatures.filter(f => f.module === module)
                  if (moduleFeatures.length === 0) return null

                  return (
                    <div key={module} className="space-y-3">
                      <h3 className="text-lg font-medium capitalize border-b pb-2">
                        {module === 'memory' && '🧠 Memory'}
                        {module === 'insights' && '📊 Insights'}
                        {module === 'launch' && '🚀 Launch'}
                        {module === 'build' && '⚡ Build'}
                        {module === 'admin' && '⚙️ Admin'}
                      </h3>
                      <div className="grid gap-3">
                        {moduleFeatures.map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.display_name}</h4>
                                {feature.requires_commercial && (
                                  <Badge variant="outline" className="text-xs">
                                    Solo Núcleo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TenantsPage
