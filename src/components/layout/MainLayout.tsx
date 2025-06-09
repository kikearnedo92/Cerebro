
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Database, Users, BarChart3, Menu, X, ChevronDown, User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Force admin for eduardo@retorna.app
  const isAdmin = profile?.role_system === 'admin' || user?.email === 'eduardo@retorna.app'

  const navItems = [
    { path: '/chat', label: 'Chat', icon: MessageSquare, forAll: true },
    { path: '/admin/knowledge', label: 'Knowledge Base', icon: Database, adminOnly: true },
    { path: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  ]

  const filteredNavItems = navItems.filter(item => 
    item.forAll || (item.adminOnly && isAdmin)
  )

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const names = name.split(' ')
    return names.map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Cerebro Branding */}
            <div className="flex items-center gap-6">
              <Link to="/chat" className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    CEREBRO
                  </span>
                  <span className="text-xs text-gray-500 font-medium">by Retorna</span>
                </div>
              </Link>

              {/* Desktop Navigation Menu - Only show if admin */}
              {isAdmin && (
                <nav className="hidden md:flex items-center gap-1">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link to={item.path}>
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {item.adminOnly && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              Admin
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    )
                  })}
                </nav>
              )}
            </div>

            {/* Right side - User Menu and Mobile Menu Button */}
            <div className="flex items-center gap-2">
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-10">
                    <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getInitials(profile?.full_name || user?.email || '')}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'Usuario'}
                        </p>
                        {isAdmin && (
                          <Badge variant="default" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {profile?.area && profile?.rol_empresa && (
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {profile.area}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {profile.rol_empresa}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu Button - Only show if admin */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation - Only show if admin */}
          {mobileMenuOpen && isAdmin && (
            <nav className="md:hidden border-t border-gray-200 py-3">
              <div className="flex flex-col gap-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "default" : "ghost"}
                      asChild
                      className="justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to={item.path} className="flex items-center gap-3 w-full">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.adminOnly && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            Admin
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
