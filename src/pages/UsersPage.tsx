
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Mail, Calendar, Shield, Building, User, Search } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  created_at: string
  last_login?: string
  status: 'active' | 'pending' | 'disabled'
}

const RETORNA_AREAS = [
  'Customer Success',
  'Tesorería', 
  'Compliance',
  'Growth',
  'Producto',
  'Operaciones',
  'People',
  'Administración',
  'Otros'
]

const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: '1',
      email: 'eduardo@retorna.app',
      full_name: 'Eduardo Administrador',
      area: 'Administración',
      rol_empresa: 'Director',
      role_system: 'admin',
      created_at: '2024-01-01',
      last_login: '2024-01-15T10:30:00Z',
      status: 'active'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInviteUser = () => {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      email: 'nuevo@retorna.app',
      full_name: 'Nuevo Usuario',
      area: 'Customer Success',
      rol_empresa: 'Agente',
      role_system: 'user',
      created_at: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setUsers(prev => [newUser, ...prev])
    setInviteModalOpen(false)
  }

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role_system: newRole } : u
    ))
  }

  const updateUserStatus = (userId: string, newStatus: 'active' | 'pending' | 'disabled') => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ))
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra los usuarios de Cerebro - Retorna</p>
          </div>
          
          <Button 
            onClick={() => setInviteModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Usuario
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role_system === 'admin').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.map((userProfile) => (
                <div
                  key={userProfile.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{userProfile.full_name}</p>
                        <Badge 
                          variant={userProfile.status === 'active' ? 'default' : userProfile.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {userProfile.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{userProfile.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {userProfile.area}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {userProfile.rol_empresa}
                        </Badge>
                        {userProfile.role_system === 'admin' && (
                          <Badge className="bg-purple-600 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userProfile.last_login ? (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Último acceso</p>
                        <p className="text-xs">{new Date(userProfile.last_login).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Nunca</p>
                    )}
                    
                    <select
                      value={userProfile.role_system}
                      onChange={(e) => updateUserRole(userProfile.id, e.target.value)}
                      className="ml-4 px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    <select
                      value={userProfile.status}
                      onChange={(e) => updateUserStatus(userProfile.id, e.target.value as any)}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="active">Activo</option>
                      <option value="pending">Pendiente</option>
                      <option value="disabled">Deshabilitado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invite Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Invitar Nuevo Usuario - Retorna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Email (@retorna.app)" />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Seleccionar área</option>
                  {RETORNA_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Seleccionar rol</option>
                  <option value="Agente">Agente</option>
                  <option value="Analista">Analista</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleInviteUser} className="flex-1">
                    Enviar Invitación
                  </Button>
                  <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage
