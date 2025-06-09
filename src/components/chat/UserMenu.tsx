
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  ChevronDown,
  Settings 
} from 'lucide-react'

const UserMenu = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleProfileClick = () => {
    setIsOpen(false)
    navigate('/profile')
  }

  const handleAdminClick = () => {
    setIsOpen(false)
    navigate('/admin')
  }

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 p-2 rounded-md transition-colors"
      >
        <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
          <p className="text-xs text-gray-500">{profile?.area || 'Sin área'}</p>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {isAdmin ? 'Admin' : 'Usuario'}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {profile?.area || 'Sin área'}
                  </span>
                </div>
              </div>
              
              {/* Menu Items */}
              <button
                onClick={handleProfileClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4 mr-2 inline" />
                Mi Perfil
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2 inline" />
                  Panel Admin
                </button>
              )}
              
              <div className="border-t border-gray-200 my-1" />
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
