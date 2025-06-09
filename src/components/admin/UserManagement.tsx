
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Search, UserPlus, Mail, Shield, Users as UsersIcon } from 'lucide-react'
import InviteUserForm from './InviteUserForm'

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, area, rolEmpresa }: { 
      userId: string, 
      role?: string, 
      area?: string, 
      rolEmpresa?: string 
    }) => {
      const updateData: any = {}
      if (role !== undefined) updateData.role_system = role
      if (area !== undefined) updateData.area = area
      if (rolEmpresa !== undefined) updateData.rol_empresa = rolEmpresa

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const getStatusBadge = (lastLogin: string | null) => {
    if (!lastLogin) return <Badge variant="secondary">Nunca</Badge>
    
    const lastLoginDate = new Date(lastLogin)
    const now = new Date()
    const diffHours = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return <Badge variant="default">Activo hoy</Badge>
    } else if (diffHours < 168) { // 7 days
      return <Badge variant="secondary">Esta semana</Badge>
    } else {
      return <Badge variant="outline">Inactivo</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UsersIcon className="w-6 h-6" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
          </div>
          <Button onClick={() => setShowInviteForm(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invitar Usuario
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="text-center py-8">Cargando usuarios...</div>
        ) : (
          <div className="grid gap-4">
            {users?.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {user.full_name}
                        {user.role_system === 'admin' && (
                          <Shield className="w-4 h-4 text-orange-500" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(user.last_login)}
                      <Badge 
                        variant={user.role_system === 'admin' ? 'default' : 'secondary'}
                      >
                        {user.role_system === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rol del sistema */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rol del Sistema</label>
                      <Select
                        value={user.role_system}
                        onValueChange={(value) => 
                          updateRoleMutation.mutate({ userId: user.id, role: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Área */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Área</label>
                      <Select
                        value={user.area}
                        onValueChange={(value) => 
                          updateRoleMutation.mutate({ userId: user.id, area: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATC">ATC</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Onboarding">Onboarding</SelectItem>
                          <SelectItem value="Data">Data</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rol Empresa */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rol en Empresa</label>
                      <Select
                        value={user.rol_empresa}
                        onValueChange={(value) => 
                          updateRoleMutation.mutate({ userId: user.id, rolEmpresa: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agente">Agente</SelectItem>
                          <SelectItem value="Analista">Analista</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <div>Creado: {new Date(user.created_at).toLocaleDateString()}</div>
                    {user.last_login && (
                      <div>Último acceso: {new Date(user.last_login).toLocaleString()}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {users?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite User Form */}
      {showInviteForm && (
        <InviteUserForm
          onClose={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false)
            queryClient.invalidateQueries({ queryKey: ['users'] })
          }}
        />
      )}
    </div>
  )
}

export default UserManagement
