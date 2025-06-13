import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Building2, Plus, Users, Database, Zap, Edit, Trash2 } from 'lucide-react'
import { Tenant } from '@/types/database'
import { Navigate } from 'react-router-dom'

const TenantsPage = () => {
  const { isSuperAdmin, loading: authLoading } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants()
    }
  }, [isSuperAdmin])

  const fetchTenants = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching tenants...')
      
      // Usar una consulta más simple para evitar problemas de RLS
      const { data, error } = await supabase.rpc('get_all_tenants_for_super_admin')
      
      if (error) {
        console.error('RPC error, trying direct query:', error)
        
        // Fallback a consulta directa
        const { data: directData, error: directError } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false })

        if (directError) {
          console.error('Direct query error:', directError)
          throw directError
        }
        
        setTenants(directData || [])
      } else {
        setTenants(data || [])
      }
      
      console.log('✅ Tenants loaded successfully')
    } catch (error) {
      console.error('Error fetching tenants:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los tenants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTenantIcon = (subdomain: string) => {
    switch (subdomain) {
      case 'retorna':
        return <Building2 className="w-5 h-5 text-purple-600" />
      case 'dev':
        return <Zap className="w-5 h-5 text-green-600" />
      case 'demo':
        return <Users className="w-5 h-5 text-blue-600" />
      default:
        return <Building2 className="w-5 h-5 text-gray-600" />
    }
  }

  const getTenantBadge = (tenant: Tenant) => {
    if (tenant.is_internal) {
      return <Badge className="bg-purple-600">Internal</Badge>
    }
    
    switch (tenant.plan) {
      case 'starter':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Starter</Badge>
      case 'pro':
        return <Badge variant="outline" className="border-green-500 text-green-600">Pro</Badge>
      case 'enterprise':
        return <Badge className="bg-orange-600">Enterprise</Badge>
      default:
        return <Badge variant="secondary">{tenant.plan}</Badge>
    }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Ilimitado' : limit.toLocaleString()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!authLoading && !isSuperAdmin) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Tenants</h1>
          <p className="text-gray-600">Administra todos los ambientes y configuraciones</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tenant</DialogTitle>
              <DialogDescription>
                Configura un nuevo ambiente para la aplicación
              </DialogDescription>
            </DialogHeader>
            <CreateTenantForm 
              onSuccess={() => {
                setCreateDialogOpen(false)
                fetchTenants()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTenantIcon(tenant.subdomain)}
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription>@{tenant.subdomain}</CardDescription>
                    </div>
                  </div>
                  {getTenantBadge(tenant)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Estado</p>
                    <Badge 
                      variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tenant.subscription_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Plan</p>
                    <p className="font-medium">{tenant.plan}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Usuarios:</span>
                    <span className="font-medium">{formatLimit(tenant.max_users)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Storage:</span>
                    <span className="font-medium">{formatLimit(tenant.max_storage_gb)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Consultas/mes:</span>
                    <span className="font-medium">{formatLimit(tenant.max_monthly_queries)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  {!tenant.is_internal && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const CreateTenantForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    plan: 'starter',
    max_users: 10,
    max_storage_gb: 5,
    max_monthly_queries: 1000,
    admin_email: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('tenants')
        .insert({
          name: formData.name,
          subdomain: formData.subdomain.toLowerCase(),
          plan: formData.plan,
          max_users: formData.max_users,
          max_storage_gb: formData.max_storage_gb,
          max_monthly_queries: formData.max_monthly_queries,
          admin_email: formData.admin_email,
          subscription_status: 'trial',
          is_internal: false,
          areas: ['General']
        })

      if (error) throw error

      toast({
        title: "✅ Tenant creado",
        description: `El tenant ${formData.name} ha sido creado exitosamente`
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating tenant:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error creando tenant',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mi Empresa"
            required
          />
        </div>
        <div>
          <Label htmlFor="subdomain">Subdominio</Label>
          <Input
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
            placeholder="mi-empresa"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="plan">Plan</Label>
        <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="max_users">Max Usuarios</Label>
          <Input
            id="max_users"
            type="number"
            value={formData.max_users}
            onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>
        <div>
          <Label htmlFor="max_storage_gb">Storage (GB)</Label>
          <Input
            id="max_storage_gb"
            type="number"
            value={formData.max_storage_gb}
            onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>
        <div>
          <Label htmlFor="max_monthly_queries">Consultas/mes</Label>
          <Input
            id="max_monthly_queries"
            type="number"
            value={formData.max_monthly_queries}
            onChange={(e) => setFormData({ ...formData, max_monthly_queries: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="admin_email">Email del Admin</Label>
        <Input
          id="admin_email"
          type="email"
          value={formData.admin_email}
          onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
          placeholder="admin@empresa.com"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Tenant'}
      </Button>
    </form>
  )
}

export default TenantsPage
