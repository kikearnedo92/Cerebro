
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, UserPlus, Shield, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Profile } from '@/types/database'

const UserManagement = () => {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching users from profiles table...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🔍 Raw query result:', { data, error })

      if (error) {
        console.error('❌ Error fetching users:', error)
        setUsers([])
        return
      }

      console.log('✅ Users loaded successfully:', data?.length || 0)
      console.log('📊 Users data:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('❌ Unexpected error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
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
      'Administración': 'bg-purple-100 text-purple-800',
      'Customer Success': 'bg-green-100 text-green-800',
      'Producto': 'bg-blue-100 text-blue-800',
      'Growth': 'bg-orange-100 text-orange-800',
      'Tesorería': 'bg-yellow-100 text-yellow-800',
      'Operaciones': 'bg-cyan-100 text-cyan-800',
      'Compliance': 'bg-red-100 text-red-800',
      'People': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[area] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invitar Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-lg font-bold">
                  {users.filter(u => u.role_system === 'admin' || u.role_system === 'super_admin' || u.is_super_admin).length}
                </p>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {users.filter(u => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const userDate = new Date(u.created_at)
                    return userDate >= today
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Registros Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-lg font-bold">
                  {users.filter(u => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    const userDate = new Date(u.created_at)
                    return userDate >= weekAgo
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Nuevos (7 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay usuarios registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Rol Empresa</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAreaColor(user.area)}>
                        {user.area}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.rol_empresa}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role_system === 'admin' || user.role_system === 'super_admin' || user.is_super_admin ? 'default' : 'secondary'}>
                        {user.role_system === 'admin' || user.role_system === 'super_admin' || user.is_super_admin ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.is_super_admin ? 'Super Admin' : 'Admin'}
                          </>
                        ) : (
                          'Usuario'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserManagement
