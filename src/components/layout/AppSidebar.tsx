
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Brain, 
  MessageSquare, 
  Database, 
  BarChart3, 
  Users, 
  Settings2, 
  Zap,
  ChevronUp,
  User,
  LogOut,
  Plus
} from 'lucide-react'
import TenantSwitcher from '@/components/TenantSwitcher'

export function AppSidebar() {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSidebar()

  const handleLogout = async () => {
    console.log('🚪 Attempting logout from AppSidebar')
    try {
      await signOut()
      console.log('✅ Logout successful, redirecting to landing')
      navigate('/landing', { replace: true })
    } catch (error) {
      console.error('❌ Logout error:', error)
      navigate('/landing', { replace: true })
    }
  }

  const mainNavigation = [
    {
      title: 'Chat',
      url: '/chat',
      icon: MessageSquare,
      isActive: location.pathname === '/chat',
    }
  ]

  const adminNavigation = [
    {
      title: 'Knowledge Base',
      url: '/knowledge',
      icon: Database,
      isActive: location.pathname === '/knowledge',
      visible: isAdmin || isSuperAdmin
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
      isActive: location.pathname === '/users',
      visible: isAdmin || isSuperAdmin
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
      isActive: location.pathname === '/analytics',
      visible: isAdmin || isSuperAdmin
    },
    {
      title: 'Integraciones',
      url: '/integrations',
      icon: Zap,
      isActive: location.pathname === '/integrations',
      visible: isAdmin || isSuperAdmin
    }
  ].filter(item => item.visible)

  const superAdminNavigation = [
    {
      title: 'Tenants',
      url: '/admin/tenants',
      icon: Settings2,
      isActive: location.pathname === '/admin/tenants',
      visible: isSuperAdmin
    }
  ].filter(item => item.visible)

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          {state === "expanded" && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">CEREBRO</span>
              <span className="truncate text-xs text-muted-foreground">Asistente IA</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Tenant Switcher para Super Admins */}
        <TenantSwitcher />

        {/* Nueva Conversación */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/chat')}
                  className="w-full"
                  tooltip="Nueva Conversación"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Conversación</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegación Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url) }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegación Admin */}
        {adminNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url) }}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navegación Super Admin */}
        {superAdminNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url) }}>
                        <item.icon className="h-4 w-4" />
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
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                    <span className="text-sm font-medium text-purple-600">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {state === "expanded" && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {profile?.full_name || 'Usuario'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {profile?.area || 'Sin área'}
                      </span>
                    </div>
                  )}
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                className="w-[--radix-popper-anchor-width]"
              >
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                      <span className="text-sm font-medium text-purple-600">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {profile?.full_name || 'Usuario'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {isSuperAdmin && (
                      <Badge variant="default" className="bg-red-600 text-xs">
                        Super
                      </Badge>
                    )}
                    {isAdmin && !isSuperAdmin && (
                      <Badge variant="default" className="bg-purple-600 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
