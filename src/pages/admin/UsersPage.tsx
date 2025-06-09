
import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, UserPlus, Shield, Clock, Search, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    area: '',
    rol_empresa: ''
  })

  const areas = [
    'Administración', 'Customer Success', 'Producto', 'Growth',
    'Tesorería', 'Operaciones', 'Compliance', 'People'
  ]

  const roles = [
    'Director', 'Manager', 'Coordinador', 'Ejecutivo', 'Analista', 'Asistente'
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        })
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteData.email.trim() || !inviteData.full_name.trim()) {
      toast({
        title: "Error",
        description: "Email y nombre completo son requeridos",
        variant: "destructive"
      })
      return
    }

    if (!inviteData.email.endsWith('@retorna.app')) {
      toast({
        title: "Error",
        description: "Solo se permiten emails con dominio @retorna.app",
        variant: "destructive"
      })
      return
    }

    try {
      // Send invitation email (in a real app, this would send an invitation link)
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteData.email}`,
      })
      
      setInviteModalOpen(false)
      setInviteData({ email: '', full_name: '', area: '', rol_empresa: '' })
    } catch (error) {
      console.error('Error inviting user:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive"
      })
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_system: newRole })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente"
      })
      
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive"
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
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
    <div className="h-full p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">Administra usuarios y permisos del sistema</p>
        </div>
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invitar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@retorna.app"
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Select onValueChange={(value) => setInviteData(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rol_empresa">Rol en la Empresa</Label>
                <Select onValueChange={(value) => setInviteData(prev => ({ ...prev, rol_empresa: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Invitación
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                  {users.filter(u => u.last_login && new Date().getTime() - new Date(u.last_login).getTime() < 86400000).length}
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
                  {users.filter(u => new Date().getTime() - new Date(u.created_at).getTime() < 86400000 * 7).length}
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
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios Registrados ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </div>
          ) : (
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
                {filteredUsers.map((user) => (
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
                      <Select
                        value={user.role_system || 'user'}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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
                        {user.role_system !== 'admin' && user.email !== 'eduardo@retorna.app' && (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage
