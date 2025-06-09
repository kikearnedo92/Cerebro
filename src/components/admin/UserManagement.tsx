
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, UserPlus, Shield, Clock } from 'lucide-react'

const UserManagement = () => {
  // Mock user data - replace with actual data from Supabase
  const users = [
    {
      id: '1',
      email: 'eduardo@retorna.app',
      full_name: 'Eduardo Retorna',
      area: 'Administración',
      rol_empresa: 'Director',
      role_system: 'admin',
      last_login: new Date(Date.now() - 3600000),
      created_at: new Date(Date.now() - 86400000 * 30)
    },
    {
      id: '2',
      email: 'ana.garcia@retorna.app',
      full_name: 'Ana García',
      area: 'Customer Success',
      rol_empresa: 'Manager',
      role_system: 'user',
      last_login: new Date(Date.now() - 7200000),
      created_at: new Date(Date.now() - 86400000 * 15)
    }
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
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
      'People': 'bg-pink-100 text-pink-800'
    }
    return colors[area] || 'bg-gray-100 text-gray-800'
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
                  {users.filter(u => u.role_system === 'admin').length}
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
                  {users.filter(u => u.last_login && new Date().getTime() - u.last_login.getTime() < 86400000).length}
                </p>
                <p className="text-sm text-gray-600">Activos Hoy</p>
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
                  {users.filter(u => new Date().getTime() - u.created_at.getTime() < 86400000 * 7).length}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Rol Empresa</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Acciones</TableHead>
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
                    <Badge variant={user.role_system === 'admin' ? 'default' : 'secondary'}>
                      {user.role_system === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'Usuario'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login ? (
                      <span className="text-sm text-gray-600">
                        {formatDate(user.last_login)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      {user.role_system !== 'admin' && (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserManagement
