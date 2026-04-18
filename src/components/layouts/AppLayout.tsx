import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { Brain } from 'lucide-react'

const AppLayout = () => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname.replace('/app', '')
    switch (path) {
      case '':
      case '/':
      case '/chat':
        return 'Chat'
      case '/knowledge':
        return 'Base de Conocimiento'
      case '/users':
        return 'Usuarios'
      case '/settings':
        return 'Configuracion'
      case '/profile':
        return 'Perfil'
      default:
        return 'Chat'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-base font-semibold text-slate-900">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                  Beta
                </Badge>
                {isSuperAdmin && (
                  <Badge variant="default" className="bg-red-600 text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4">
            <div className="flex-1 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
