
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Settings, Database, BarChart3, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const UserMenu = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (!user || !profile) return null

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">{profile.full_name}</p>
        <div className="flex items-center gap-1">
          <Badge variant={profile.role_system === 'admin' ? 'default' : 'secondary'} className="text-xs">
            {profile.role_system === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
          <span className="text-xs text-gray-500">• {profile.area}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
          
          {profile.role_system === 'admin' && (
            <>
              <DropdownMenuItem onClick={() => navigate('/knowledge-base')}>
                <Database className="mr-2 h-4 w-4" />
                <span>Knowledge Base</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/users')}>
                <Users className="mr-2 h-4 w-4" />
                <span>Gestión Usuarios</span>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserMenu
