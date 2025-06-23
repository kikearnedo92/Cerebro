
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface FeatureFlag {
  id: string
  name: string
  description: string
  is_global: boolean
}

interface TenantFeatureFlag {
  id: string
  tenant_id: string
  feature_flag_id: string
  is_enabled: boolean
  config: Record<string, any>
  feature_flag: FeatureFlag
}

interface UserFeaturePermission {
  id: string
  user_id: string
  feature_flag_id: string
  tenant_id: string
  is_enabled: boolean
  feature_flag: FeatureFlag
}

export const useFeatureFlags = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [tenantFlags, setTenantFlags] = useState<TenantFeatureFlag[]>([])
  const [userPermissions, setUserPermissions] = useState<UserFeaturePermission[]>([])

  // Check if user has access to a specific feature
  const hasFeatureAccess = async (featureName: string, tenantId?: string): Promise<boolean> => {
    if (!user) return false
    
    // Super admin or eduardo@retorna.app always has access
    if (profile?.is_super_admin || profile?.email === 'eduardo@retorna.app') {
      return true
    }

    try {
      const { data, error } = await supabase.rpc('user_has_feature_access', {
        _user_id: user.id,
        _feature_name: featureName,
        _tenant_id: tenantId || profile?.tenant_id
      })

      if (error) {
        console.error('Error checking feature access:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  // Load all feature flags (for admin)
  const loadFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name')

      if (error) throw error
      setFeatureFlags(data || [])
    } catch (error) {
      console.error('Error loading feature flags:', error)
    }
  }

  // Load tenant feature flags
  const loadTenantFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_feature_flags')
        .select(`
          *,
          feature_flag:feature_flags(*)
        `)
        .order('created_at')

      if (error) throw error
      setTenantFlags(data || [])
    } catch (error) {
      console.error('Error loading tenant flags:', error)
    }
  }

  // Load user permissions
  const loadUserPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_feature_permissions')
        .select(`
          *,
          feature_flag:feature_flags(*)
        `)
        .order('created_at')

      if (error) throw error
      setUserPermissions(data || [])
    } catch (error) {
      console.error('Error loading user permissions:', error)
    }
  }

  // Toggle tenant feature flag
  const toggleTenantFeature = async (tenantId: string, featureId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('tenant_feature_flags')
        .upsert({
          tenant_id: tenantId,
          feature_flag_id: featureId,
          is_enabled: enabled
        }, {
          onConflict: 'tenant_id,feature_flag_id'
        })

      if (error) throw error
      await loadTenantFlags()
    } catch (error) {
      console.error('Error toggling tenant feature:', error)
      throw error
    }
  }

  // Toggle user permission
  const toggleUserPermission = async (userId: string, featureId: string, tenantId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('user_feature_permissions')
        .upsert({
          user_id: userId,
          feature_flag_id: featureId,
          tenant_id: tenantId,
          is_enabled: enabled,
          granted_by: user?.id
        }, {
          onConflict: 'user_id,feature_flag_id,tenant_id'
        })

      if (error) throw error
      await loadUserPermissions()
    } catch (error) {
      console.error('Error toggling user permission:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user && (profile?.is_super_admin || profile?.email === 'eduardo@retorna.app')) {
      Promise.all([
        loadFeatureFlags(),
        loadTenantFlags(),
        loadUserPermissions()
      ]).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user, profile])

  return {
    loading,
    featureFlags,
    tenantFlags,
    userPermissions,
    hasFeatureAccess,
    toggleTenantFeature,
    toggleUserPermission,
    loadFeatureFlags,
    loadTenantFlags,
    loadUserPermissions
  }
}
