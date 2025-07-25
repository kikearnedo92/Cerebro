
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import CerebroSidebar from './CerebroSidebar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ExternalLink, Brain } from 'lucide-react'

const CerebroLayout = () => {
  const { isSuperAdmin } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname.replace('/cerebro', '')
    switch (path) {
      case '/chat':
        return 'Memory'
      case '/insights':
        return 'Insights'
      case '/knowledge':
        return 'Knowledge Base'
      case '/users':
        return 'Users'
      case '/analytics':
        return 'Analytics'
      case '/integrations':
        return 'Integrations'
      case '/feature-flags':
        return 'Feature Flags'
      case '/admin/tenants':
        return 'Tenants'
      case '/profile':
        return 'Profile'
      case '/settings/personality':
        return 'Personality Settings'
      default:
        return 'Memory'
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-purple-900">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
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
            <div className="min-h-[100vh] flex-1 rounded-xl bg-white/50 backdrop-blur-sm md:min-h-min p-6">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default CerebroLayout
