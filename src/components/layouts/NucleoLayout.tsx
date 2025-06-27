
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import NucleoSidebar from './NucleoSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

const NucleoLayout = () => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname.replace('/nucleo', '')
    switch (path) {
      case '/chat':
        return 'Memory'
      case '/insights':
        return 'Insights'
      case '/launch':
        return 'Launch'
      case '/autodev':
        return 'AutoDev'
      case '/automation':
        return 'Automation'
      case '/knowledge':
        return 'Knowledge'
      case '/users':
        return 'Users'
      case '/analytics':
        return 'Analytics'
      case '/integrations':
        return 'Integrations'
      case '/profile':
        return 'Profile'
      default:
        return 'Memory'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-green-50">
        <NucleoSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-blue-200">
                  Núcleo v2.0
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
            <div className="min-h-[100vh] flex-1 rounded-xl bg-white/50 backdrop-blur-sm md:min-h-min p-6">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default NucleoLayout
