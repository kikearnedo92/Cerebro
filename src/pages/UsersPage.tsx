
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react'
import { Profile } from '@/types/database'
import { Navigate } from 'react-router-dom'

const UsersPage = () => {
  const { isAdmin, isSuperAdmin, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      fetchUsers()
    }
  }, [isAdmin, isSuperAdmin])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching users...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log('✅ Users loaded:', data?.length)
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente"
      })

      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      })
    }
  }

  const handleEditUser = (user: Profile) => {
    setEditingUser(user)
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async (updatedData: Partial<Profile>) => {
    if (!editingUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', editingUser.id)

      if (error) throw error

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados"
      })

      setEditDialogOpen(false)
      setEditingUser(null)
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      })
    }
  }

  const getRoleBadge = (user: Profile) => {
    if (user.is_super_admin) {
      return <Badge className="bg-red-600">Super Admin</Badge>
    }
    if (user.role_system === 'admin') {
      return <Badge className="bg-purple-600">Admin</Badge>
    }
    return <Badge variant="secondary">Usuario</Badge>
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!authLoading && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y permisos de la plataforma</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.full_name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  {getRoleBadge(user)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Área</p>
                    <p className="font-medium">{user.area}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rol en empresa</p>
                    <p className="font-medium">{user.rol_empresa}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Consultas diarias</p>
                    <p className="font-medium">{user.queries_used_today || 0} / {user.daily_query_limit || 50}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  {!user.is_super_admin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los permisos y configuración del usuario
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm 
              user={editingUser}
              onUpdate={handleUpdateUser}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const EditUserForm = ({ 
  user, 
  onUpdate,
  isSuperAdmin 
}: { 
  user: Profile
  onUpdate: (data: Partial<Profile>) => void
  isSuperAdmin: boolean
}) => {
  const [formData, setFormData] = useState({
    role_system: user.role_system,
    daily_query_limit: user.daily_query_limit || 50,
    is_super_admin: user.is_super_admin || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role_system">Rol del Sistema</Label>
        <Select 
          value={formData.role_system} 
          onValueChange={(value) => setFormData({ ...formData, role_system: value })}
        >
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
        <Label htmlFor="daily_query_limit">Límite de Consultas Diarias</Label>
        <Input
          id="daily_query_limit"
          type="number"
          value={formData.daily_query_limit}
          onChange={(e) => setFormData({ ...formData, daily_query_limit: parseInt(e.target.value) })}
          min="1"
          max="1000"
        />
      </div>

      {isSuperAdmin && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_super_admin"
            checked={formData.is_super_admin}
            onChange={(e) => setFormData({ ...formData, is_super_admin: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_super_admin">Super Administrador</Label>
        </div>
      )}

      <Button type="submit" className="w-full">
        Actualizar Usuario
      </Button>
    </form>
  )
}

export default UsersPage
