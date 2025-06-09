
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Database, Users, BarChart3, Menu, X } from 'lucide-react'
import UserMenu from '@/components/chat/UserMenu'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { profile } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = profile?.role_system === 'admin'

  const navItems = [
    { path: '/chat', label: 'Chat', icon: MessageSquare, forAll: true },
    { path: '/admin/knowledge', label: 'Knowledge Base', icon: Database, adminOnly: true },
    { path: '/admin/users', label: 'Usuarios', icon: Users, adminOnly: true },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  ]

  const filteredNavItems = navItems.filter(item => 
    item.forAll || (item.adminOnly && isAdmin)
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Navigation */}
      <header className="border-b px-4 py-3 bg-white shadow-sm relative z-50">
        <div className="flex justify-between items-center">
          {/* Cerebro Branding */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  CEREBRO
                </span>
                <span className="text-xs text-gray-500 font-medium">by Retorna</span>
              </div>
            </Link>

            {/* Desktop Navigation Menu */}
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
          </div>

          {/* Right side - User Menu and Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <UserMenu />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pb-3 border-t border-gray-200 pt-3">
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
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
