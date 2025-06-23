
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Settings, Users, Building2 } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  domain: string
}

interface User {
  id: string
  email: string
  full_name: string
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
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loadingAction, setLoadingAction] = useState(false)

  // Load tenants and users
  useEffect(() => {
    loadTenantsAndUsers()
  }, [])

  const loadTenantsAndUsers = async () => {
    try {
      // Load tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, domain')
        .order('name')

      if (tenantsError) throw tenantsError
      setTenants(tenantsData || [])

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email')

      if (usersError) throw usersError
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error loading tenants and users:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      })
    }
  }

  const handleToggleTenantFeature = async (tenantId: string, featureId: string, enabled: boolean) => {
    setLoadingAction(true)
    try {
      await toggleTenantFeature(tenantId, featureId, enabled)
      toast({
        title: "Éxito",
        description: `Feature ${enabled ? 'activado' : 'desactivado'} para el tenant`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el feature flag",
        variant: "destructive"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const handleToggleUserPermission = async (userId: string, featureId: string, tenantId: string, enabled: boolean) => {
    setLoadingAction(true)
    try {
      await toggleUserPermission(userId, featureId, tenantId, enabled)
      toast({
        title: "Éxito",
        description: `Permiso ${enabled ? 'otorgado' : 'revocado'} al usuario`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso",
        variant: "destructive"
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const getTenantFeatureStatus = (tenantId: string, featureId: string) => {
    const tenantFlag = tenantFlags.find(
      tf => tf.tenant_id === tenantId && tf.feature_flag_id === featureId
    )
    return tenantFlag?.is_enabled || false
  }

  const getUserPermissionStatus = (userId: string, featureId: string, tenantId: string) => {
    const permission = userPermissions.find(
      up => up.user_id === userId && up.feature_flag_id === featureId && up.tenant_id === tenantId
    )
    return permission?.is_enabled || false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Feature Flags Manager</h2>
        <p className="text-muted-foreground">
          Controla qué módulos están disponibles para cada tenant y usuario
        </p>
      </div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tenant" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Por Tenant</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Por Usuario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Configuración por Tenant</span>
              </CardTitle>
              <CardDescription>
                Activa o desactiva módulos para tenants específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                    </div>
                    <Badge variant="outline">{tenant.id}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featureFlags.map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="font-medium">{feature.name}</Label>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                          checked={getTenantFeatureStatus(tenant.id, feature.id)}
                          onCheckedChange={(enabled) => 
                            handleToggleTenantFeature(tenant.id, feature.id, enabled)
                          }
                          disabled={loadingAction}
                        />
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Configuración por Usuario</span>
              </CardTitle>
              <CardDescription>
                Otorga permisos específicos a usuarios individuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seleccionar Tenant</Label>
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tenant" />
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

                <div className="space-y-2">
                  <Label>Seleccionar Usuario</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTenant && selectedUser && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="font-semibold">Permisos de Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureFlags.map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="font-medium">{feature.name}</Label>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                          checked={getUserPermissionStatus(selectedUser, feature.id, selectedTenant)}
                          onCheckedChange={(enabled) => 
                            handleToggleUserPermission(selectedUser, feature.id, selectedTenant, enabled)
                          }
                          disabled={loadingAction}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
