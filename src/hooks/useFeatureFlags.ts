
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
  tenant_id: string
  feature_flag_id: string
  is_enabled: boolean
}

interface UserPermission {
  user_id: string
  feature_flag_id: string
  tenant_id: string
  is_enabled: boolean
  granted_by: string
}

export const useFeatureFlags = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [tenantFlags, setTenantFlags] = useState<TenantFeatureFlag[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])

  console.log('🚀 useFeatureFlags - User:', user?.email)
  console.log('🚀 useFeatureFlags - Profile:', profile)

  // Enhanced feature access check
  const hasFeatureAccess = (featureName: string): boolean => {
    if (!user || !profile) {
      console.log('❌ No user or profile')
      return false
    }
    
    // Super admin or eduardo@retorna.app always has access
    const isSuperAdmin = profile?.is_super_admin || 
                        profile?.email === 'eduardo@retorna.app' ||
                        profile?.role_system === 'super_admin'
    
    if (isSuperAdmin) {
      console.log('✅ Super admin access granted for:', featureName)
      return true
    }

    // Basic features for all authenticated users
    const basicFeatures = ['chat_ai', 'memory_chat', 'insights_analytics']
    if (basicFeatures.includes(featureName)) {
      console.log('✅ Basic feature access granted for:', featureName)
      return true
    }

    console.log('❌ Feature access denied for:', featureName)
    return false
  }

  // Load feature flags
  const loadFeatureFlags = async () => {
    if (!user) {
      console.log('❌ No user, skipping feature flags load')
      setLoading(false)
      return
    }

    const isSuperAdmin = profile?.is_super_admin || 
                        profile?.email === 'eduardo@retorna.app' ||
                        profile?.role_system === 'super_admin'

    if (!isSuperAdmin) {
      console.log('❌ Not super admin, limited access')
      setLoading(false)
      return
    }

    try {
      console.log('📊 Loading feature flags...')
      
      // Load feature flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name')

      if (flagsError) {
        console.error('❌ Error loading feature flags:', flagsError)
        throw flagsError
      }

      console.log('✅ Feature flags loaded:', flagsData?.length || 0)
      setFeatureFlags(flagsData || [])

      // Load tenant flags
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_feature_flags')
        .select('*')

      if (tenantError) {
        console.error('❌ Error loading tenant flags:', tenantError)
      } else {
        console.log('✅ Tenant flags loaded:', tenantData?.length || 0)
        setTenantFlags(tenantData || [])
      }

      // Load user permissions
      const { data: permData, error: permError } = await supabase
        .from('user_feature_permissions')
        .select('*')

      if (permError) {
        console.error('❌ Error loading user permissions:', permError)
      } else {
        console.log('✅ User permissions loaded:', permData?.length || 0)
        setUserPermissions(permData || [])
      }

    } catch (error) {
      console.error('❌ Error in loadFeatureFlags:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle tenant feature
  const toggleTenantFeature = async (tenantId: string, featureId: string, enabled: boolean) => {
    try {
      console.log('🔄 Toggling tenant feature:', { tenantId, featureId, enabled })
      
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
      
      console.log('✅ Tenant feature toggled successfully')
      await loadFeatureFlags()
    } catch (error) {
      console.error('❌ Error toggling tenant feature:', error)
      throw error
    }
  }

  // Toggle user permission
  const toggleUserPermission = async (userId: string, featureId: string, tenantId: string, enabled: boolean) => {
    try {
      console.log('🔄 Toggling user permission:', { userId, featureId, tenantId, enabled })
      
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
      
      console.log('✅ User permission toggled successfully')
      await loadFeatureFlags()
    } catch (error) {
      console.error('❌ Error toggling user permission:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user && profile) {
      console.log('🔄 Loading feature flags for user:', user.email)
      loadFeatureFlags()
    } else {
      console.log('⏳ Waiting for user and profile...')
      setLoading(false)
    }
  }, [user?.id, profile?.id])

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
