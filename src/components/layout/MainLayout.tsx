
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Database, Users, BarChart3, Upload } from 'lucide-react'
import UserMenu from '@/components/chat/UserMenu'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { profile } = useAuth()
  const location = useLocation()
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
    <div className="h-screen flex flex-col">
      {/* Header with Navigation */}
      <header className="border-b px-4 py-3 bg-white shadow-sm">
        <div className="flex justify-between items-center">
          {/* Cerebro Branding */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white brain-glow" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl cerebro-brand">CEREBRO</span>
                <span className="text-xs text-gray-500 font-medium">by Retorna</span>
              </div>
            </Link>

            {/* Navigation Menu */}
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

          {/* User Menu */}
          <UserMenu />
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 flex gap-1 overflow-x-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Link to={item.path}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
