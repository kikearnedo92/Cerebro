
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Users, 
  Building2, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  Search,
  Plus
} from 'lucide-react'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Tenant {
  id: string
  name: string
  subdomain: string
}

interface User {
  id: string
  email: string
  full_name: string
  area: string
}

export const FeatureFlagsManager = () => {
  const { 
    loading, 
    featureFlags, 
    tenantFlags, 
    userPermissions,
    toggleTenantFeature,
    toggleUserPermission 
  } = useFeatureFlags()
  
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Load tenants and users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantsResult, usersResult] = await Promise.all([
          supabase.from('tenants').select('id, name, subdomain').order('name'),
          supabase.from('profiles').select('id, email, full_name, area').order('full_name')
        ])

        if (tenantsResult.error) throw tenantsResult.error
        if (usersResult.error) throw usersResult.error

        setTenants(tenantsResult.data || [])
        setUsers(usersResult.data || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        })
      }
    }

    loadData()
  }, [])

  const handleTenantToggle = async (tenantId: string, featureId: string, enabled: boolean) => {
    try {
      await toggleTenantFeature(tenantId, featureId, enabled)
      toast({
        title: "Actualizado",
        description: `Feature ${enabled ? 'habilitado' : 'deshabilitado'} para el tenant`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el feature flag",
        variant: "destructive"
      })
    }
  }

  const handleUserToggle = async (userId: string, featureId: string, tenantId: string, enabled: boolean) => {
    try {
      await toggleUserPermission(userId, featureId, tenantId, enabled)
      toast({
        title: "Actualizado",
        description: `Permiso ${enabled ? 'otorgado' : 'revocado'} al usuario`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso",
        variant: "destructive"
      })
    }
  }

  const getTenantFeatureStatus = (tenantId: string, featureId: string) => {
    const tenantFlag = tenantFlags.find(tf => 
      tf.tenant_id === tenantId && tf.feature_flag_id === featureId
    )
    return tenantFlag?.is_enabled || false
  }

  const getUserPermissionStatus = (userId: string, featureId: string, tenantId: string) => {
    const permission = userPermissions.find(up => 
      up.user_id === userId && up.feature_flag_id === featureId && up.tenant_id === tenantId
    )
    return permission?.is_enabled || false
  }

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Cargando feature flags...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
          <p className="text-gray-600">Gestiona el acceso a módulos por tenant y usuario</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <Badge variant="secondary">{featureFlags.length} features</Badge>
        </div>
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Por Tenant</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Por Usuario</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control por Tenant</CardTitle>
              <CardDescription>
                Habilita o deshabilita módulos completos para cada tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">{tenant.subdomain}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {featureFlags.map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">{feature.name}</Label>
                            <p className="text-xs text-gray-500">{feature.description}</p>
                          </div>
                          <Switch
                            checked={getTenantFeatureStatus(tenant.id, feature.id)}
                            onCheckedChange={(checked) => 
                              handleTenantToggle(tenant.id, feature.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control por Usuario</CardTitle>
              <CardDescription>
                Otorga permisos específicos a usuarios individuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Buscar Usuario</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="tenant-select">Tenant</Label>
                    <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tenant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedTenant && (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.full_name}</h3>
                            <p className="text-sm text-gray-500">{user.email} - {user.area}</p>
                          </div>
                          {user.email === 'eduardo@retorna.app' && (
                            <Badge variant="default">Super Admin</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {featureFlags.map((feature) => (
                            <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <Label className="text-sm font-medium">{feature.name}</Label>
                                <p className="text-xs text-gray-500">{feature.description}</p>
                              </div>
                              <Switch
                                checked={getUserPermissionStatus(user.id, feature.id, selectedTenant)}
                                onCheckedChange={(checked) => 
                                  handleUserToggle(user.id, feature.id, selectedTenant, checked)
                                }
                                disabled={user.email === 'eduardo@retorna.app'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags Disponibles</CardTitle>
              <CardDescription>
                Listado de todos los módulos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {featureFlags.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={feature.is_global ? "default" : "secondary"}>
                        {feature.is_global ? 'Global' : 'Por Tenant'}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {tenantFlags.filter(tf => tf.feature_flag_id === feature.id && tf.is_enabled).length} tenants activos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
