
import React from 'react'
import { Calendar, FileText, Users, Settings, BarChart3, Puzzle, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import TenantSwitcher from '@/components/TenantSwitcher'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const AppSidebar = () => {
  const { user, profile, isAdmin, isSuperAdmin } = useAuth()
  const { conversations, loading, refreshConversations, createConversation } = useConversations()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) throw error

      await refreshConversations()
      
      if (location.pathname.includes(conversationId)) {
        navigate('/chat')
      }
      
      toast({
        title: "Conversación eliminada",
        description: "La conversación ha sido eliminada correctamente"
      })
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación",
        variant: "destructive"
      })
    }
  }

  const handleNewConversation = async () => {
    try {
      const conversationId = await createConversation()
      navigate(`/chat/${conversationId}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la conversación",
        variant: "destructive"
      })
    }
  }

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`)
  }

  const isActive = (path: string) => {
    if (path === '/chat') {
      return location.pathname === '/chat' || location.pathname.startsWith('/chat/')
    }
    return location.pathname === path
  }

  const mainMenuItems = [
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ]

  const adminMenuItems = [
    { path: '/admin/knowledge', label: 'Knowledge Base', icon: FileText },
    { path: '/users', label: 'Usuarios', icon: Users },
    { path: '/integrations', label: 'Integraciones', icon: Puzzle },
    { path: '/admin/analytics', label: 'Analytics Admin', icon: BarChart3 }
  ]

  const superAdminMenuItems = [
    { path: '/admin/tenants', label: 'Tenants', icon: Settings }
  ]

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        {isSuperAdmin && <TenantSwitcher />}
        
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">CEREBRO</h2>
          <p className="text-sm text-gray-500">AI Assistant</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Páginas</h3>
          <SidebarMenu>
            {mainMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    className={cn(isActive(item.path) && "bg-purple-50 text-purple-600")}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>

        {/* Admin Section */}
        {(isAdmin || isSuperAdmin) && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-700">Administración</h3>
              {isSuperAdmin && <Badge className="bg-red-600 text-xs">Super</Badge>}
              {isAdmin && !isSuperAdmin && <Badge className="bg-purple-600 text-xs">Admin</Badge>}
            </div>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.path)}
                      className={cn(isActive(item.path) && "bg-purple-50 text-purple-600")}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        )}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Super Admin</h3>
            <SidebarMenu>
              {superAdminMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.path)}
                      className={cn(isActive(item.path) && "bg-purple-50 text-purple-600")}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        )}

        {/* Conversations Section */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Conversaciones</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No hay conversaciones
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 group",
                    location.pathname.includes(conversation.id) && "bg-purple-50 border border-purple-200"
                  )}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm truncate">{conversation.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate('/profile')}>
              <Settings className="w-4 h-4" />
              <span>Perfil</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
