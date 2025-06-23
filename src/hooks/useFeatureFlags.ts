
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
}

interface UserFeaturePermission {
  id: string
  user_id: string
  feature_flag_id: string
  tenant_id: string
  is_enabled: boolean
}

export const useFeatureFlags = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [tenantFlags, setTenantFlags] = useState<TenantFeatureFlag[]>([])
  const [userPermissions, setUserPermissions] = useState<UserFeaturePermission[]>([])

  // Simple feature access check - just return true for super admin for now
  const hasFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!user) return false
    
    // Super admin or eduardo@retorna.app always has access
    if (profile?.is_super_admin || profile?.email === 'eduardo@retorna.app') {
      return true
    }

    // For now, enable basic features for all users to test
    if (['chat_ai'].includes(featureName)) {
      return true
    }

    return false
  }

  // Load feature flags (only for super admin)
  const loadFeatureFlags = async () => {
    if (!user || (!profile?.is_super_admin && profile?.email !== 'eduardo@retorna.app')) {
      setLoading(false)
      return
    }

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

  // Simplified toggle functions
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
      await loadFeatureFlags()
    } catch (error) {
      console.error('Error toggling tenant feature:', error)
      throw error
    }
  }

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
    } catch (error) {
      console.error('Error toggling user permission:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      loadFeatureFlags().finally(() => setLoading(false))
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
    loadFeatureFlags
  }
}
