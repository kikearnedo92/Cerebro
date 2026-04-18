import React from 'react'
import {
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  ChevronUp,
  User2,
  LogOut,
  Brain,
  LayoutDashboard,
  Plug,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

const AppSidebar = () => {
  const { user, profile, signOut, isAdmin, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const nav = (path: string) => navigate(`/app${path}`)

  const mainItems = [
    { title: 'Chat', url: '/chat', icon: MessageSquare },
    { title: 'Base de Conocimiento', url: '/knowledge', icon: BookOpen },
    { title: 'Integraciones', url: '/integrations', icon: Plug },
  ]

  const adminItems = [
    { title: 'Usuarios', url: '/users', icon: Users },
    { title: 'Configuracion', url: '/settings', icon: Settings },
  ]

  return (
    <Sidebar variant="inset" className="border-r-slate-200">
      <SidebarHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav('/chat')}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">CEREBRO</span>
                  <span className="truncate text-xs text-indigo-200">
                    {profile?.company_name || 'Tu empresa'}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => nav(item.url)}
                    isActive={location.pathname === `/app${item.url}` || (item.url === '/chat' && location.pathname === '/app')}
                    className="data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-900 hover:bg-indigo-50 cursor-pointer"
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
            <SidebarGroupLabel className="text-slate-500">Administracion</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => nav(item.url)}
                      isActive={location.pathname === `/app${item.url}`}
                      className="data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-900 hover:bg-indigo-50 cursor-pointer"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/admin')}
                    className="hover:bg-red-50 cursor-pointer"
                  >
                    <LayoutDashboard />
                    <span>Panel Admin</span>
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
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-indigo-50">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-indigo-100 text-indigo-600">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                <DropdownMenuItem onClick={() => nav('/profile')}>
                  <User2 className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuracion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesion
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
