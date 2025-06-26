
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import CerebroSidebar from './CerebroSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const CerebroLayout = () => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/chat':
        return 'Chat'
      case '/insights':
        return 'Insights'
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
        return 'Chat'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-purple-50">
        <CerebroSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold text-purple-900">
                {getPageTitle()}
              </h1>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => window.open('/nucleo', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ir a Núcleo
                </Button>
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                  Cerebro v2.0
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
            <div className="min-h-[100vh] flex-1 rounded-xl bg-white/50 backdrop-blur-sm md:min-h-min">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default CerebroLayout
