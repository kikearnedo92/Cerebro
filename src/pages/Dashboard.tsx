import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Database, BarChart3, Users, LogOut, User, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TenantSwitcher from '@/components/TenantSwitcher'

const Dashboard = () => {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'knowledge', name: 'Knowledge Base', icon: Database, adminOnly: false },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, adminOnly: true },
    { id: 'users', name: 'Usuarios', icon: Users, adminOnly: true }
  ]

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin || isSuperAdmin)

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Chat con Cerebro</h3>
              <p className="text-gray-600 max-w-md">
                Próximamente podrás chatear con nuestro asistente de IA para obtener respuestas instantáneas.
              </p>
            </div>
          </div>
        )
      case 'knowledge':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <Database className="w-12 h-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h3>
              <p className="text-gray-600 max-w-md">
                Aquí podrás subir y gestionar documentos para alimentar a Cerebro.
              </p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Analytics</h3>
              <p className="text-gray-600 max-w-md">
                Estadísticas de uso y métricas de la plataforma.
              </p>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h3>
              <p className="text-gray-600 max-w-md">
                Administra usuarios y permisos de la plataforma.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CEREBRO</h1>
                  <p className="text-xs text-gray-500">by Retorna</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tenant Switcher para Super Admins */}
          <TenantSwitcher />

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
              <div className="flex flex-col gap-1">
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    activeTab === item.id ? 'bg-purple-600 text-white' : ''
                  }`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* User Menu */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredNavigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
              </h2>
            </div>
            <Badge variant="outline" className="text-xs">
              v1.0
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
