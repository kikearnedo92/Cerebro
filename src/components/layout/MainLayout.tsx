
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'

const MainLayout = () => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/chat':
        return 'Chat'
      case '/insights':
        return 'Insights'
      case '/launch':
        return 'Launch'
      case '/autodev':
        return 'AutoDev'
      case '/automation':
        return 'Automation'
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
        <SidebarInset className="flex-1">
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
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
