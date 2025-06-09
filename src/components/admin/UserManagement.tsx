
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { Search, Users, Shield, Calendar, Mail, Building, UserCheck } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  last_login: string | null
  created_at: string
}

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as UserProfile[]
    }
  })

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role_system: newRole })
        .eq('id', userId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente."
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

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    updateRoleMutation.mutate({ userId, newRole })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      'People': 'bg-blue-100 text-blue-800',
      'Growth': 'bg-green-100 text-green-800',
      'Producto': 'bg-purple-100 text-purple-800',
      'Customer Success': 'bg-orange-100 text-orange-800',
      'Tesorería': 'bg-yellow-100 text-yellow-800',
      'Operaciones': 'bg-cyan-100 text-cyan-800',
      'Administración': 'bg-gray-100 text-gray-800',
      'Compliance': 'bg-red-100 text-red-800'
    }
    return colors[area] || 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {users?.length || 0} usuarios registrados
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{users?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter(u => u.role_system === 'admin').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter(u => u.last_login).length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(users?.map(u => u.area)).size || 0}
                  </p>
                  <p className="text-sm text-gray-600">Áreas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando usuarios...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Rol Empresa</TableHead>
                    <TableHead>Permisos Sistema</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getAreaColor(user.area)}>
                          {user.area}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.rol_empresa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role_system)}>
                          {user.role_system === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Administrador
                            </>
                          ) : (
                            'Usuario'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(user.last_login)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.id, user.role_system)}
                          disabled={updateRoleMutation.isPending}
                        >
                          {user.role_system === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {users?.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserManagement
