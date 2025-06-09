
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, BarChart3, Database, Users, MessageSquare } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import UserMenu from '@/components/chat/UserMenu'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      current: location.pathname === '/chat'
    }
  ]

  const adminNavigation = [
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Knowledge Base',
      href: '/admin/knowledge',
      icon: Database,
      current: location.pathname === '/admin/knowledge'
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    }
  ]

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CEREBRO</h1>
              <p className="text-xs text-gray-500">by Retorna</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.area}</p>
            </div>
            {isAdmin && (
              <Badge variant="default" className="bg-purple-600">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Principal
            </p>
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? 'default' : 'ghost'}
                className={`w-full justify-start ${item.current ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Button>
            ))}
          </div>

          {isAdmin && (
            <div className="pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Administración
              </p>
              {adminNavigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? 'default' : 'ghost'}
                  className={`w-full justify-start ${item.current ? 'bg-purple-600 text-white' : ''}`}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              ))}
            </div>
          )}
        </nav>

        {/* User Menu at Bottom */}
        <div className="p-4 border-t border-gray-200">
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/chat' && 'Chat con Cerebro'}
              {location.pathname === '/profile' && 'Mi Perfil'}
              {location.pathname === '/admin/analytics' && 'Analytics'}
              {location.pathname === '/admin/knowledge' && 'Base de Conocimiento'}
              {location.pathname === '/admin/users' && 'Gestión de Usuarios'}
            </h2>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                v1.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout
