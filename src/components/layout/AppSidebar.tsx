
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
  Plus,
  Search,
  MessageSquare,
  ChevronUp,
  User,
  LogOut,
  Database,
  Users,
  BarChart3,
  Zap,
  Settings2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'

export function AppSidebar() {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('')
  
  const {
    conversations,
    currentConversation,
    selectConversation,
    startNewConversation
  } = useConversations()

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

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    return date.toLocaleDateString()
  }

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
              <span className="truncate text-xs text-muted-foreground">Conversaciones</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Nueva Conversación */}
        <div className="p-4 border-b border-sidebar-border">
          <Button 
            onClick={startNewConversation}
            className="w-full flex items-center space-x-2 bg-primary hover:bg-primary/90"
            size={state === "collapsed" ? "icon" : "default"}
          >
            <Plus className="w-4 h-4" />
            {state === "expanded" && <span>Nueva Conversación</span>}
          </Button>
        </div>
        
        {/* Search - Solo en modo expandido */}
        {state === "expanded" && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Lista de Conversaciones */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2">
            {state === "collapsed" ? (
              // Modo colapsado - solo iconos
              conversations.slice(0, 5).map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-full h-10"
                  onClick={() => selectConversation(conversation)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              ))
            ) : (
              // Modo expandido - lista completa
              filteredConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay conversaciones aún
                </p>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                      currentConversation?.id === conversation.id ? 'border-primary bg-accent' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )
            )}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start data-[state=open]:bg-accent"
              size={state === "collapsed" ? "icon" : "default"}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <span className="text-sm font-medium text-purple-600">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {state === "expanded" && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.area || 'Sin área'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            className="w-64"
            align={state === "collapsed" ? "start" : "end"}
          >
            {/* User Info */}
            <div className="p-3">
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
            
            {/* Navigation */}
            {(isAdmin || isSuperAdmin) && (
              <>
                <DropdownMenuItem onClick={() => handleNavigation('/knowledge')}>
                  <Database className="mr-2 h-4 w-4" />
                  Knowledge Base
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/users')}>
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/integrations')}>
                  <Zap className="mr-2 h-4 w-4" />
                  Integraciones
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem onClick={() => handleNavigation('/admin/tenants')}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Tenants
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            
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
      </SidebarFooter>
    </Sidebar>
  )
}
