import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Edit, Shield, UserCheck, Settings } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import UserLimitDialog from '@/components/admin/UserLimitDialog'

interface User {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  is_super_admin: boolean
  created_at: string
  daily_query_limit: number
  queries_used_today: number
}

const UsersPage = () => {
  const { isAdmin, isSuperAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false)

  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    area: '',
    rol_empresa: '',
    role_system: 'user',
    daily_query_limit: 50
  })

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_system: newRole, is_super_admin: newRole === 'super_admin' })
        .eq('id', userId)
      
      if (error) throw error
      
      toast({
        title: "Usuario actualizado",
        description: `Rol cambiado a ${newRole}`,
      })
      
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      })
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      console.log('👥 UsersPage: Fetching users...')
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ UsersPage: DB query failed:', error.message)
        const fallbackUsers = currentUser ? [{
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuario',
          area: 'Administración',
          rol_empresa: 'Super Admin',
          role_system: isSuperAdmin ? 'super_admin' : 'admin',
          is_super_admin: isSuperAdmin,
          created_at: new Date().toISOString(),
          daily_query_limit: 1000,
          queries_used_today: 0
        }] : []
        
        setUsers(fallbackUsers)
      } else {
        console.log('✅ UsersPage: Loaded', data?.length || 0, 'users')
        setUsers(data || [])
      }
    } catch (error) {
      console.error('❌ UsersPage: Error fetching users:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser, isSuperAdmin])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [])

  const createUser = async () => {
    try {
      if (!newUser.email || !newUser.full_name) {
        toast({
          title: "Error",
          description: "Email y nombre completo son requeridos",
          variant: "destructive"
        })
        return
      }

      console.log('👤 UsersPage: Creating user:', newUser.email)

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'TempPass123!',
        email_confirm: true,
        user_metadata: {
          full_name: newUser.full_name,
          area: newUser.area,
          rol_empresa: newUser.rol_empresa
        }
      })

      if (authError) {
        console.error('❌ UsersPage: Auth creation failed:', authError)
        toast({
          title: "Error",
          description: "No se pudo crear el usuario",
          variant: "destructive"
        })
        return
      }

      const profileData = {
        id: authData.user.id,
        email: newUser.email,
        full_name: newUser.full_name,
        area: newUser.area || 'General',
        rol_empresa: newUser.rol_empresa || 'Usuario',
        role_system: newUser.role_system,
        is_super_admin: newUser.role_system === 'super_admin',
        daily_query_limit: newUser.daily_query_limit,
        queries_used_today: 0
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)

      if (profileError) {
        console.warn('⚠️ UsersPage: Profile creation failed:', profileError)
      }

      toast({
        title: "Usuario creado",
        description: `Usuario ${newUser.email} creado exitosamente`,
      })

      setNewUser({
        email: '',
        full_name: '',
        area: '',
        rol_empresa: '',
        role_system: 'user',
        daily_query_limit: 50
      })

      await fetchUsers()

    } catch (error) {
      console.error('❌ UsersPage: Error creating user:', error)
      toast({
        title: "Error",
        description: "Error al crear usuario",
        variant: "destructive"
      })
    }
  }

  const handleEditLimit = (user: User) => {
    setSelectedUser(user)
    setIsLimitDialogOpen(true)
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
              <p className="text-gray-500">No tienes permisos para acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema CEREBRO</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-purple-600" />
          <Badge variant="secondary">{users.length} usuarios</Badge>
        </div>
      </div>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Crear Nuevo Usuario</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@retorna.app"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  value={newUser.area}
                  onChange={(e) => setNewUser(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Ventas, Marketing, etc."
                />
              </div>
              <div>
                <Label htmlFor="rol_empresa">Rol en Empresa</Label>
                <Input
                  id="rol_empresa"
                  value={newUser.rol_empresa}
                  onChange={(e) => setNewUser(prev => ({ ...prev, rol_empresa: e.target.value }))}
                  placeholder="Analista, Manager, etc."
                />
              </div>
              <div>
                <Label htmlFor="role_system">Rol del Sistema</Label>
                <Select value={newUser.role_system} onValueChange={(value) => setNewUser(prev => ({ ...prev, role_system: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="daily_limit">Límite Diario Consultas</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  value={newUser.daily_query_limit}
                  onChange={(e) => setNewUser(prev => ({ ...prev, daily_query_limit: parseInt(e.target.value) || 50 }))}
                />
              </div>
            </div>
            <Button onClick={createUser} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role_system === 'super_admin' ? 'default' : user.role_system === 'admin' ? 'secondary' : 'outline'}>
                        {user.role_system === 'super_admin' ? 'Super Admin' : 
                         user.role_system === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                      <span className="text-xs text-gray-500">{user.area}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {isSuperAdmin && user.id !== currentUser?.id && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateUserRole(user.id, user.role_system === 'admin' ? 'user' : 'admin')}
                        >
                          {user.role_system === 'admin' ? 'Hacer Usuario' : 'Hacer Admin'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditLimit(user)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Editar Límite
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Consultas: {user.queries_used_today}/{user.daily_query_limit}</p>
                  <p>Desde: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">No hay usuarios registrados</p>
          </CardContent>
        </Card>
      )}

      <UserLimitDialog
        isOpen={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />
    </div>
  )
}

export default UsersPage
