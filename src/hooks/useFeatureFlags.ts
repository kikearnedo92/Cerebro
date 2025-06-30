
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'

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
  console.log('🚀 useFeatureFlags - Current feature flags:', featureFlags.length)

  // Enhanced feature access check with real-time validation
  const hasFeatureAccess = (featureName: string): boolean => {
    if (!user || !profile) {
      console.log('❌ No user or profile for feature:', featureName)
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

    // Check specific feature flag in database
    const feature = featureFlags.find(f => f.name === featureName)
    if (!feature) {
      console.log('❌ Feature not found in flags:', featureName)
      return false
    }

    // Check user specific permissions first
    const userPermission = userPermissions.find(
      up => up.user_id === user.id && up.feature_flag_id === feature.id
    )
    
    if (userPermission) {
      console.log(`${userPermission.is_enabled ? '✅' : '❌'} User permission for ${featureName}:`, userPermission.is_enabled)
      return userPermission.is_enabled
    }

    // Check tenant level permissions
    const tenantFlag = tenantFlags.find(
      tf => tf.feature_flag_id === feature.id
    )
    
    if (tenantFlag) {
      console.log(`${tenantFlag.is_enabled ? '✅' : '❌'} Tenant permission for ${featureName}:`, tenantFlag.is_enabled)
      return tenantFlag.is_enabled
    }

    // Check global flags
    if (feature.is_global) {
      console.log('✅ Global feature access granted for:', featureName)
      return true
    }

    console.log('❌ No access found for feature:', featureName)
    return false
  }

  // Load feature flags with better error handling
  const loadFeatureFlags = async () => {
    if (!user) {
      console.log('❌ No user, skipping feature flags load')
      setLoading(false)
      return
    }

    try {
      console.log('📊 Loading feature flags for user:', user.email)
      
      // Load all feature flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name')

      if (flagsError) {
        console.error('❌ Error loading feature flags:', flagsError)
      } else {
        console.log('✅ Feature flags loaded:', flagsData?.length || 0)
        setFeatureFlags(flagsData || [])
      }

      // Load tenant flags for current user's tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_feature_flags')
        .select('*')

      if (tenantError) {
        console.error('❌ Error loading tenant flags:', tenantError)
      } else {
        console.log('✅ Tenant flags loaded:', tenantData?.length || 0)
        setTenantFlags(tenantData || [])
      }

      // Load user specific permissions
      const { data: permData, error: permError } = await supabase
        .from('user_feature_permissions')
        .select('*')
        .eq('user_id', user.id)

      if (permError) {
        console.error('❌ Error loading user permissions:', permError)
      } else {
        console.log('✅ User permissions loaded:', permData?.length || 0)
        setUserPermissions(permData || [])
      }

    } catch (error) {
      console.error('❌ Error in loadFeatureFlags:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los feature flags",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle tenant feature with immediate UI update
  const toggleTenantFeature = async (tenantId: string, featureId: string, enabled: boolean) => {
    try {
      console.log('🔄 Toggling tenant feature:', { tenantId, featureId, enabled })
      
      // Optimistic update
      setTenantFlags(prev => {
        const existing = prev.find(tf => tf.tenant_id === tenantId && tf.feature_flag_id === featureId)
        if (existing) {
          return prev.map(tf => 
            tf.tenant_id === tenantId && tf.feature_flag_id === featureId 
              ? { ...tf, is_enabled: enabled }
              : tf
          )
        } else {
          return [...prev, { tenant_id: tenantId, feature_flag_id: featureId, is_enabled: enabled }]
        }
      })
      
      const { error } = await supabase
        .from('tenant_feature_flags')
        .upsert({
          tenant_id: tenantId,
          feature_flag_id: featureId,
          is_enabled: enabled
        }, {
          onConflict: 'tenant_id,feature_flag_id'
        })

      if (error) {
        console.error('❌ Database error:', error)
        // Revert optimistic update on error
        await loadFeatureFlags()
        throw error
      }
      
      console.log('✅ Tenant feature toggled successfully')
      toast({
        title: "Éxito",
        description: `Feature ${enabled ? 'activado' : 'desactivado'} correctamente`,
      })
    } catch (error) {
      console.error('❌ Error toggling tenant feature:', error)
      toast({
        title: "Error", 
        description: "No se pudo actualizar el feature flag",
        variant: "destructive"
      })
      throw error
    }
  }

  // Toggle user permission with immediate UI update
  const toggleUserPermission = async (userId: string, featureId: string, tenantId: string, enabled: boolean) => {
    try {
      console.log('🔄 Toggling user permission:', { userId, featureId, tenantId, enabled })
      
      // Optimistic update
      setUserPermissions(prev => {
        const existing = prev.find(up => up.user_id === userId && up.feature_flag_id === featureId && up.tenant_id === tenantId)
        if (existing) {
          return prev.map(up => 
            up.user_id === userId && up.feature_flag_id === featureId && up.tenant_id === tenantId
              ? { ...up, is_enabled: enabled }
              : up
          )
        } else {
          return [...prev, { 
            user_id: userId, 
            feature_flag_id: featureId, 
            tenant_id: tenantId, 
            is_enabled: enabled,
            granted_by: user?.id || ''
          }]
        }
      })
      
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

      if (error) {
        console.error('❌ Database error:', error)
        // Revert optimistic update on error
        await loadFeatureFlags()
        throw error
      }
      
      console.log('✅ User permission toggled successfully')
      toast({
        title: "Éxito",
        description: `Permiso ${enabled ? 'otorgado' : 'revocado'} correctamente`,
      })
    } catch (error) {
      console.error('❌ Error toggling user permission:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso",
        variant: "destructive"
      })
      throw error
    }
  }

  // Real-time subscription to feature flag changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('feature_flags_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tenant_feature_flags' },
        (payload) => {
          console.log('🔄 Tenant feature flag changed:', payload)
          loadFeatureFlags()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_feature_permissions' },
        (payload) => {
          console.log('🔄 User permission changed:', payload)
          if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
            loadFeatureFlags()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

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
