
import * as React from 'react'
import { useState, useEffect } from 'react'
import {
  Bot,
  MessageSquare,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  Shield,
  Zap,
  Brain,
  Code,
  TrendingUp,
  ToggleLeft
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate, useLocation } from 'react-router-dom'

const AppSidebar = () => {
  const { user, profile, signOut } = useAuth()
  const { hasFeatureAccess } = useFeatureFlags()
  const navigate = useNavigate()
  const location = useLocation()
  const [availableFeatures, setAvailableFeatures] = useState({
    chat_ai: false,
    insights: false,
    autodev: false
  })

  // Check feature access when component mounts
  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (!user || !profile) return

      const features = {
        chat_ai: await hasFeatureAccess('chat_ai'),
        insights: await hasFeatureAccess('insights'),
        autodev: await hasFeatureAccess('autodev')
      }

      setAvailableFeatures(features)
    }

    checkFeatureAccess()
  }, [user, profile, hasFeatureAccess])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigationItems = [
    // Chat AI - Always visible but may be disabled
    {
      title: 'Chat',
      url: '/chat',
      icon: MessageSquare,
      feature: 'chat_ai',
      enabled: availableFeatures.chat_ai
    },
    // Insights
    {
      title: 'Insights',
      url: '/insights',
      icon: TrendingUp,
      feature: 'insights',
      enabled: availableFeatures.insights
    },
    // AutoDev
    {
      title: 'AutoDev',
      url: '/autodev',
      icon: Code,
      feature: 'autodev',
      enabled: availableFeatures.autodev
    }
  ]

  const adminItems = [
    {
      title: 'Base de Conocimiento',
      url: '/knowledge',
      icon: BookOpen,
    },
    {
      title: 'Usuarios',
      url: '/users',
      icon: Users,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
    },
    {
      title: 'Integraciones',
      url: '/integrations',
      icon: Settings,
    }
  ]

  const superAdminItems = [
    {
      title: 'Feature Flags',
      url: '/feature-flags',
      icon: ToggleLeft,
    }
  ]

  const isSuperAdmin = profile?.is_super_admin || profile?.email === 'eduardo@retorna.app'
  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin' || isSuperAdmin

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                <div className="flex items-center gap-2">
                  <Brain className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">CEREBRO</span>
                    <span className="truncate text-xs text-purple-100">Retorna AI</span>
                  </div>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Módulos Principales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname.startsWith(item.url)}
                    disabled={!item.enabled}
                    className={!item.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <a href={item.enabled ? item.url : '#'} onClick={(e) => {
                      if (!item.enabled) {
                        e.preventDefault()
                        return
                      }
                    }}>
                      <item.icon />
                      <span>{item.title}</span>
                      {!item.enabled && <span className="text-xs text-muted-foreground ml-auto">Sin acceso</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Navigation */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="rounded-lg">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User2 className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
