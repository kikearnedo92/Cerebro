
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface Product {
  id: string
  name: string
  display_name: string
  description: string
  features: string[]
  branding: any
  is_commercial: boolean
}

interface FeatureFlagEnhanced {
  id: string
  name: string
  display_name: string
  description: string
  module: string
  is_global: boolean
  requires_commercial: boolean
}

interface TenantFeatureFlag {
  id: string
  tenant_id: string
  feature_flag_id: string
  is_enabled: boolean
}

export const useEnhancedFeatureFlags = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [availableFeatures, setAvailableFeatures] = useState<FeatureFlagEnhanced[]>([])
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])

  // Load product and feature configuration
  const loadConfiguration = async () => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    try {
      // Get current tenant's product
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('product_id, products(*)')
        .eq('id', profile.tenant_id || 'default')
        .single()

      if (tenantData?.products) {
        setCurrentProduct(tenantData.products as Product)
      } else {
        // Default to Cerebro for existing users
        const { data: cerebroProduct } = await supabase
          .from('products')
          .select('*')
          .eq('name', 'cerebro')
          .single()
        
        if (cerebroProduct) {
          setCurrentProduct(cerebroProduct)
        }
      }

      // Load all available feature flags
      const { data: features } = await supabase
        .from('feature_flags_enhanced')
        .select('*')
        .order('module', { ascending: true })

      if (features) {
        setAvailableFeatures(features)
      }

      // Load tenant-specific enabled features
      if (profile.tenant_id) {
        const { data: tenantFlags } = await supabase
          .from('tenant_feature_flags_enhanced')
          .select('feature_flags_enhanced(name)')
          .eq('tenant_id', profile.tenant_id)
          .eq('is_enabled', true)

        if (tenantFlags) {
          const enabled = tenantFlags
            .map(tf => (tf as any).feature_flags_enhanced?.name)
            .filter(Boolean) as string[]
          setEnabledFeatures(enabled)
        }
      }
    } catch (error) {
      console.error('Error loading feature configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if a specific feature is enabled
  const hasFeatureAccess = (featureName: string): boolean => {
    // Super admin has access to everything
    if (profile?.is_super_admin || profile?.email === 'eduardo@retorna.app') {
      return true
    }

    // Check if feature is in enabled list
    return enabledFeatures.includes(featureName)
  }

  // Check if user can access a module
  const hasModuleAccess = (module: string): boolean => {
    const moduleFeatures = availableFeatures
      .filter(f => f.module === module)
      .map(f => f.name)
    
    return moduleFeatures.some(feature => hasFeatureAccess(feature))
  }

  // Get enabled features by module
  const getModuleFeatures = (module: string) => {
    return availableFeatures
      .filter(f => f.module === module && hasFeatureAccess(f.name))
  }

  // Toggle feature for tenant (admin only)
  const toggleTenantFeature = async (featureId: string, enabled: boolean) => {
    if (!profile?.tenant_id || !profile?.is_super_admin) {
      throw new Error('Unauthorized')
    }

    const { error } = await supabase
      .from('tenant_feature_flags_enhanced')
      .upsert({
        tenant_id: profile.tenant_id,
        feature_flag_id: featureId,
        is_enabled: enabled,
        granted_by: user?.id
      }, {
        onConflict: 'tenant_id,feature_flag_id'
      })

    if (error) throw error
    await loadConfiguration()
  }

  useEffect(() => {
    if (user && profile) {
      loadConfiguration()
    } else {
      setLoading(false)
    }
  }, [user?.id, profile?.id])

  return {
    loading,
    currentProduct,
    availableFeatures,
    enabledFeatures,
    hasFeatureAccess,
    hasModuleAccess,
    getModuleFeatures,
    toggleTenantFeature,
    loadConfiguration
  }
}
