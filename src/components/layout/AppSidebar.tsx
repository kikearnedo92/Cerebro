
import * as React from 'react'
import {
  MessageSquare,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  TrendingUp,
  Code,
  ToggleLeft,
  Brain,
  Building2,
  Bot,
  Rocket
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
import { useNavigate, useLocation } from 'react-router-dom'
import { useEnhancedFeatureFlags } from '@/hooks/useEnhancedFeatureFlags'

const AppSidebar = () => {
  const { user, profile, signOut } = useAuth()
  const { hasFeatureAccess, hasModuleAccess, currentProduct } = useEnhancedFeatureFlags()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Use enhanced feature flags instead of simple permission checks
  const isSuperAdmin = profile?.is_super_admin || profile?.email === 'eduardo@retorna.app'
  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin' || isSuperAdmin

  // Enhanced navigation items using feature flags
  const navigationItems = [
    {
      title: 'Chat',
      url: '/chat',
      icon: MessageSquare,
      enabled: hasFeatureAccess('memory_chat')
    },
    {
      title: 'Insights',
      url: '/insights', 
      icon: TrendingUp,
      enabled: hasFeatureAccess('insights_analytics')
    },
    {
      title: 'Launch',
      url: '/launch',
      icon: Rocket,
      enabled: hasFeatureAccess('launch_voice')
    },
    {
      title: 'AutoDev',
      url: '/autodev',
      icon: Code,
      enabled: hasFeatureAccess('build_code')
    },
    {
      title: 'Automation',
      url: '/automation',
      icon: Bot,
      enabled: hasFeatureAccess('automation_n8n')
    }
  ]

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
                    <span className="truncate font-semibold text-white">
                      {currentProduct?.display_name || 'CEREBRO'}
                    </span>
                    <span className="truncate text-xs text-purple-100">
                      {currentProduct?.is_commercial ? 'Commercial AI' : 'Retorna AI'}
                    </span>
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

        {/* Admin Navigation - now controlled by feature flags */}
        {hasModuleAccess('admin') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasFeatureAccess('memory_knowledge') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/knowledge'}>
                      <a href="/knowledge">
                        <BookOpen />
                        <span>Base de Conocimiento</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {hasFeatureAccess('admin_users') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/users'}>
                      <a href="/users">
                        <Users />
                        <span>Usuarios</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {hasFeatureAccess('admin_analytics') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/analytics'}>
                      <a href="/analytics">
                        <BarChart3 />
                        <span>Analytics</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/integrations'}>
                    <a href="/integrations">
                      <Settings />
                      <span>Integraciones</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Navigation - enhanced with feature flags */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasFeatureAccess('admin_tenants') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin/tenants'}>
                      <a href="/admin/tenants">
                        <Building2 />
                        <span>Tenants</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/feature-flags'}>
                    <a href="/feature-flags">
                      <ToggleLeft />
                      <span>Feature Flags</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
