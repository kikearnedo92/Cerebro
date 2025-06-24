
import React from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/chat':
        return 'Chat'
      case '/insights':
        return 'Insights'
      case '/autodev':
        return 'AutoDev'
      case '/knowledge':
        return 'Base de Conocimiento'
      case '/users':
        return 'Usuarios'
      case '/analytics':
        return 'Analytics'
      case '/integrations':
        return 'Integraciones'
      case '/feature-flags':
        return 'Feature Flags'
      case '/admin/tenants':
        return 'Gestión de Tenants'
      case '/profile':
        return 'Perfil'
      default:
        if (location.pathname.startsWith('/chat/')) {
          return 'Chat'
        }
        return 'Chat'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold">
                {getPageTitle()}
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs">
                  v2.0.0
                </Badge>
                {isSuperAdmin && (
                  <Badge variant="default" className="bg-red-600 text-xs">
                    Super Admin
                  </Badge>
                )}
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
