
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
  Brain,
  Flag,
  Calendar,
  FileText
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

const CerebroSidebar = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/cerebro/landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleNavigation = (path: string) => {
    navigate(`/cerebro${path}`)
  }

  // Temporary fix: Always show admin for eduardo@retorna.app
  const isEduardoEmail = user?.email === 'eduardo@retorna.app'
  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin' || profile?.is_super_admin || isEduardoEmail
  
  // Debug admin status
  console.log('🔍 CerebroSidebar - Debug:', { 
    userEmail: user?.email,
    profileEmail: profile?.email,
    role_system: profile?.role_system, 
    is_super_admin: profile?.is_super_admin,
    profile: profile,
    isEduardoEmail,
    isAdmin 
  })

  const navigationItems = [
    {
      title: 'Memory',
      url: '/chat',
      icon: MessageSquare,
    },
    {
      title: 'Insights',
      url: '/insights',
      icon: TrendingUp,
    }
  ]

  const horarioItems = [
    {
      title: 'Calendario',
      url: '/calendario',
      icon: Calendar,
    },
    {
      title: 'Gestión de Equipo',
      url: '/equipo',
      icon: Users,
    },
    {
      title: 'Reportes',
      url: '/reportes',
      icon: FileText,
    }
  ]

  return (
    <Sidebar variant="inset" className="border-r-purple-200">
      <SidebarHeader className="bg-gradient-to-r from-purple-600 to-purple-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white">
                <div className="flex items-center gap-2">
                  <Brain className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      CEREBRO
                    </span>
                    <span className="truncate text-xs text-purple-100">
                      by Retorna
                    </span>
                  </div>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-700">Core Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={location.pathname.includes(item.url)}
                    className="data-[active=true]:bg-purple-100 data-[active=true]:text-purple-900 hover:bg-purple-50 cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-700">Customer Success</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {horarioItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={location.pathname.includes(item.url)}
                    className="data-[active=true]:bg-purple-100 data-[active=true]:text-purple-900 hover:bg-purple-50 cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || isEduardoEmail) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-purple-700">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/knowledge')}
                    isActive={location.pathname === '/cerebro/knowledge'}
                    className="cursor-pointer"
                  >
                    <BookOpen />
                    <span>Knowledge</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/users')}
                    isActive={location.pathname === '/cerebro/users'}
                    className="cursor-pointer"
                  >
                    <Users />
                    <span>Cerebro Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/analytics')}
                    isActive={location.pathname === '/cerebro/analytics'}
                    className="cursor-pointer"
                  >
                    <BarChart3 />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/integrations')}
                    isActive={location.pathname === '/cerebro/integrations'}
                    className="cursor-pointer"
                  >
                    <Settings />
                    <span>Integrations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/feature-flags')}
                    isActive={location.pathname === '/cerebro/feature-flags'}
                    className="cursor-pointer"
                  >
                    <Flag />
                    <span>Feature Flags</span>
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
                  className="data-[state=open]:bg-purple-100 data-[state=open]:text-purple-900"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="rounded-lg bg-purple-100 text-purple-600">
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
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  <User2 className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/settings/personality')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Personality Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
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

export default CerebroSidebar
