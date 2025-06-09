
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Database, BarChart3, Users, LogOut, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      current: location.pathname === '/chat'
    },
    {
      name: 'Knowledge Base',
      href: '/knowledge',
      icon: Database,
      current: location.pathname === '/knowledge'
    }
  ]

  const adminNavigation = [
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      current: location.pathname === '/users'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname === '/analytics'
    }
  ]

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
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

        <nav className="flex-1 p-4 space-y-2">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Principal
            </p>
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? 'default' : 'ghost'}
                className={`w-full justify-start mb-1 ${item.current ? 'bg-purple-600 text-white' : ''}`}
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
                  className={`w-full justify-start mb-1 ${item.current ? 'bg-purple-600 text-white' : ''}`}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <User className="w-4 h-4 mr-3" />
            Mi Perfil
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/chat' && 'Chat con Cerebro'}
              {location.pathname === '/knowledge' && 'Base de Conocimiento'}
              {location.pathname === '/users' && 'Gestión de Usuarios'}
              {location.pathname === '/analytics' && 'Analytics'}
            </h2>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                v1.0
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout
