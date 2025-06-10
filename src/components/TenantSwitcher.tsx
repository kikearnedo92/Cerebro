
import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, Zap, Users } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Tenant } from '@/types/database'

const TenantSwitcher = () => {
  const { profile } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Solo mostrar para super admins
  if (!profile?.is_super_admin) {
    return null
  }

  useEffect(() => {
    fetchTenants()
    getCurrentTenant()
  }, [])

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')

      if (error) throw error
      setTenants(data || [])
    } catch (error) {
      console.error('Error fetching tenants:', error)
    }
  }

  const getCurrentTenant = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id, tenants!inner(subdomain)')
        .eq('id', profile?.id)
        .single()

      if (error) throw error
      if (data?.tenants) {
        setCurrentTenant((data.tenants as any).subdomain)
      }
    } catch (error) {
      console.error('Error getting current tenant:', error)
    }
  }

  const switchTenant = async (subdomain: string) => {
    if (subdomain === currentTenant) return

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('switch_tenant_context', {
        p_tenant_subdomain: subdomain
      })

      if (error) throw error

      if (data?.success) {
        setCurrentTenant(subdomain)
        toast({
          title: "✅ Tenant cambiado",
          description: data.message,
        })
        
        // Recargar después de un pequeño delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(data?.message || 'Error switching tenant')
      }
    } catch (error) {
      console.error('Error switching tenant:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error cambiando tenant',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTenantIcon = (subdomain: string) => {
    switch (subdomain) {
      case 'retorna':
        return <Building2 className="w-4 h-4" />
      case 'dev':
        return <Zap className="w-4 h-4" />
      case 'demo':
        return <Users className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  const getTenantBadge = (tenant: Tenant) => {
    if (tenant.subdomain === 'retorna') {
      return <Badge className="bg-purple-600">Production</Badge>
    }
    if (tenant.subdomain === 'dev') {
      return <Badge variant="outline" className="border-green-500 text-green-600">Development</Badge>
    }
    if (tenant.subdomain === 'demo') {
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Demo</Badge>
    }
    return <Badge variant="secondary">{tenant.plan}</Badge>
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Super Admin
        </span>
        <Badge variant="default" className="bg-red-600 text-xs">
          DEV MODE
        </Badge>
      </div>
      
      <Select value={currentTenant} onValueChange={switchTenant} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar tenant">
            {currentTenant && (
              <div className="flex items-center gap-2">
                {getTenantIcon(currentTenant)}
                <span className="font-medium">
                  {tenants.find(t => t.subdomain === currentTenant)?.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.subdomain}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getTenantIcon(tenant.subdomain)}
                  <div className="flex flex-col">
                    <span className="font-medium">{tenant.name}</span>
                    <span className="text-xs text-gray-500">@{tenant.subdomain}</span>
                  </div>
                </div>
                {getTenantBadge(tenant)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {loading && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
          Cambiando tenant...
        </div>
      )}
    </div>
  )
}

export default TenantSwitcher
