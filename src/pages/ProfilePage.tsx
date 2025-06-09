
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { toast } from '@/hooks/use-toast'

const ProfilePage = () => {
  const { user, profile, loading } = useAuth()
  const [editing, setEditing] = useState(false)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center">
          <UserIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Información Personal</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Nombre Completo</Label>
              {editing ? (
                <Input 
                  defaultValue={profile?.full_name || ''}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {profile?.full_name || 'No especificado'}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                {user?.email}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Área</Label>
              {editing ? (
                <Input 
                  defaultValue={profile?.area || ''}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {profile?.area || 'No especificado'}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Rol en la Empresa</Label>
              {editing ? (
                <Input 
                  defaultValue={profile?.rol_empresa || ''}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {profile?.rol_empresa || 'No especificado'}
                </p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setEditing(false)
                toast({
                  title: "Perfil actualizado",
                  description: "Los cambios se han guardado correctamente",
                })
              }}>
                Guardar Cambios
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tipo de Usuario</span>
            <Badge variant={profile?.role_system === 'admin' ? 'default' : 'secondary'}>
              {profile?.role_system === 'admin' ? 'Administrador' : 'Usuario'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Estado</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Activo
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Miembro desde: {formatDate(profile?.created_at)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Último acceso: {formatDate(profile?.last_login)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Cambiar Contraseña</p>
              <p className="text-xs text-gray-500">Actualiza tu contraseña para mantener tu cuenta segura</p>
            </div>
            <Button variant="outline" size="sm">
              Cambiar
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sesiones Activas</p>
              <p className="text-xs text-gray-500">Gestiona dónde tienes sesión iniciada</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Sesiones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
