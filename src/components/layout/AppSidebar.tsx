
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Home, MessageSquare, BookOpen, Users, BarChart3, Settings, Plug } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'

const AppSidebar = () => {
  const location = useLocation()
  const { isAdmin } = useAuth()
  const { conversations } = useConversations()

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Chat',
      url: '/chat',
      icon: MessageSquare,
    },
    {
      title: 'Base de Conocimiento',
      url: '/knowledge',
      icon: BookOpen,
    },
    {
      title: 'Integraciones',
      url: '/integrations',
      icon: Plug,
    },
  ]

  const adminItems = [
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Usuarios',
      url: '/admin/users',
      icon: Users,
    },
    {
      title: 'Gestión Contenido',
      url: '/admin/knowledge',
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-purple-600">
          Retorna AI
        </h2>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {conversations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Conversaciones Recientes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {conversations.slice(0, 5).map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === `/chat/${conversation.id}`}
                    >
                      <Link to={`/chat/${conversation.id}`}>
                        <MessageSquare className="w-4 h-4" />
                        <span className="truncate">{conversation.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-500">
          v1.0.0 - Retorna AI
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
