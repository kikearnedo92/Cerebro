import React, { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, BookOpen, Users, BarChart3, User, Plug, Power, Crown, Brain, Zap, Settings } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { supabase } from '@/integrations/supabase/client'

const AppSidebar = () => {
  const location = useLocation()
  const { isAdmin, isSuperAdmin, profile } = useAuth()
  const { conversations } = useConversations()
  const { hasFeatureAccess } = useFeatureFlags()
  
  const [moduleAccess, setModuleAccess] = useState({
    chat_ai: true,
    insights: false,
    autodev: false,
    advanced_analytics: false
  })

  // Check feature access on mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!profile) return

      const access = {
        chat_ai: await hasFeatureAccess('chat_ai'),
        insights: await hasFeatureAccess('insights'),
        autodev: await hasFeatureAccess('autodev'),
        advanced_analytics: await hasFeatureAccess('advanced_analytics')
      }
      
      setModuleAccess(access)
    }

    checkAccess()
  }, [profile, hasFeatureAccess])

  // Elementos principales para todos los usuarios
  const mainItems = [
    {
      title: 'Chat',
      url: '/chat',
      icon: MessageSquare,
      description: 'Asistente IA interno',
      featureFlag: 'chat_ai'
    },
  ]

  // Módulos de Cerebro (Fase 2 y 3)
  const cerebroModules = [
    {
      title: 'Insights',
      url: '/insights',
      icon: Brain,
      description: 'Analytics e inteligencia de producto',
      featureFlag: 'insights'
    },
    {
      title: 'AutoDev',
      url: '/autodev',
      icon: Zap,
      description: 'Mejora continua automatizada',
      featureFlag: 'autodev'
    },
  ]

  // Elementos administrativos solo para admin
  const adminItems = [
    {
      title: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
      featureFlag: 'advanced_analytics'
    },
    {
      title: 'Usuarios',
      url: '/users',
      icon: Users,
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

  // Solo super admin puede ver feature flags
  const superAdminItems = [
    {
      title: 'Feature Flags',
      url: '/feature-flags',
      icon: Settings,
    },
  ]

  // Perfil para todos
  const profileItems = [
    {
      title: 'Perfil',
      url: '/profile',
      icon: User,
    },
  ]

  // Filter items based on feature flags
  const filterByFeatureFlag = (items: any[]) => {
    return items.filter(item => {
      if (!item.featureFlag) return true
      return moduleAccess[item.featureFlag as keyof typeof moduleAccess]
    })
  }

  const availableMainItems = filterByFeatureFlag(mainItems)
  const availableCerebroModules = filterByFeatureFlag(cerebroModules)
  const availableAdminItems = filterByFeatureFlag(adminItems)

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CEREBRO
            </h2>
            <div className="flex items-center space-x-2 -mt-1">
              <p className="text-xs text-gray-500 font-medium">by Retorna</p>
              {(isAdmin || isSuperAdmin) && (
                <Badge variant="secondary" className="text-xs px-2 py-0 bg-purple-100 text-purple-700">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-2">
        {/* Sección Principal */}
        {availableMainItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {availableMainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url || location.pathname.startsWith('/chat/')}
                      className="group transition-all duration-200 hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-100 data-[active=true]:to-indigo-100 data-[active=true]:text-purple-700 data-[active=true]:font-medium rounded-xl px-3 py-2.5"
                    >
                      <Link to={item.url} className="flex items-center w-full">
                        <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Módulos de Cerebro */}
        {availableCerebroModules.length > 0 && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-3 flex items-center">
                <Brain className="w-3 h-3 mr-2" />
                Módulos Cerebro
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {availableCerebroModules.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                        className="group transition-all duration-200 hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-100 data-[active=true]:to-indigo-100 data-[active=true]:text-purple-700 data-[active=true]:font-medium rounded-xl px-3 py-2.5"
                      >
                        <Link to={item.url} className="flex items-center w-full">
                          <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                          <div className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Conversaciones Recientes */}
        {conversations.length > 0 && moduleAccess.chat_ai && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                Conversaciones Recientes
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.slice(0, 4).map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === `/chat/${conversation.id}`}
                        className="group transition-all duration-200 hover:bg-gray-50 data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700 rounded-lg px-3 py-2 text-sm"
                      >
                        <Link to={`/chat/${conversation.id}`} className="flex items-center w-full">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></div>
                          <span className="truncate text-sm">{conversation.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Sección Administrativa */}
        {isAdmin && availableAdminItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 flex items-center">
                <Crown className="w-3 h-3 mr-2" />
                Administración
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {availableAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                        className="group transition-all duration-200 hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-100 data-[active=true]:to-indigo-100 data-[active=true]:text-purple-700 data-[active=true]:font-medium rounded-xl px-3 py-2.5"
                      >
                        <Link to={item.url} className="flex items-center w-full">
                          <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Super Admin Features */}
        {isSuperAdmin && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-red-600 uppercase tracking-wider px-3 flex items-center">
                <Settings className="w-3 h-3 mr-2" />
                Super Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {superAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                        className="group transition-all duration-200 hover:bg-red-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-red-100 data-[active=true]:to-red-100 data-[active=true]:text-red-700 data-[active=true]:font-medium rounded-xl px-3 py-2.5"
                      >
                        <Link to={item.url} className="flex items-center w-full">
                          <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <Separator className="my-4" />

        {/* Perfil */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="group transition-all duration-200 hover:bg-gray-50 data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700 data-[active=true]:font-medium rounded-xl px-3 py-2.5"
                  >
                    <Link to={item.url} className="flex items-center w-full">
                      <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="mb-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.area}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-xl px-3 py-2.5 group"
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/landing'
          }}
        >
          <Power className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Cerrar Sesión</span>
        </Button>
        
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">v2.0.0 - Retorna AI</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
