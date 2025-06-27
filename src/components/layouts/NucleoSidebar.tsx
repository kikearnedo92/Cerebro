
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
  Zap,
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

const NucleoSidebar = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/nucleo/landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleNavigation = (path: string) => {
    navigate(`/nucleo${path}`)
  }

  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin'

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
    },
    {
      title: 'Launch',
      url: '/launch',
      icon: Rocket,
    },
    {
      title: 'AutoDev',
      url: '/autodev',
      icon: Code,
    },
    {
      title: 'Automation',
      url: '/automation',
      icon: Bot,
    }
  ]

  return (
    <Sidebar variant="inset" className="border-r-blue-200">
      <SidebarHeader className="bg-gradient-to-r from-blue-600 to-green-600">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white">
                <div className="flex items-center gap-2">
                  <Zap className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      NÚCLEO
                    </span>
                    <span className="truncate text-xs text-blue-100">
                      Commercial AI
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
          <SidebarGroupLabel className="text-blue-700">AI Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    isActive={location.pathname.includes(item.url)}
                    className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-900 hover:bg-blue-50 cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-700">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/knowledge')}
                    isActive={location.pathname === '/nucleo/knowledge'}
                    className="cursor-pointer"
                  >
                    <BookOpen />
                    <span>Knowledge</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/users')}
                    isActive={location.pathname === '/nucleo/users'}
                    className="cursor-pointer"
                  >
                    <Users />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/analytics')}
                    isActive={location.pathname === '/nucleo/analytics'}
                    className="cursor-pointer"
                  >
                    <BarChart3 />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/integrations')}
                    isActive={location.pathname === '/nucleo/integrations'}
                    className="cursor-pointer"
                  >
                    <Settings />
                    <span>Integrations</span>
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
                  className="data-[state=open]:bg-blue-100 data-[state=open]:text-blue-900"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
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

export default NucleoSidebar
