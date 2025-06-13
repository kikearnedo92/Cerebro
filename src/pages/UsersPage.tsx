
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, UserPlus, Mail, Calendar, Shield, Building, User, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  created_at: string
  last_login?: string
}

const UsersPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviting, setInviting] = useState(false)

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    area: '',
    rol_empresa: ''
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('👥 Fetching users from Supabase...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          area,
          rol_empresa,
          role_system,
          created_at,
          last_login
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Users fetch error:', error)
        throw new Error(`Error cargando usuarios: ${error.message}`)
      }

      console.log('✅ Users loaded:', data?.length || 0)
      setUsers(data || [])
      
    } catch (error) {
      console.error('Users fetch failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteForm.email || !inviteForm.area || !inviteForm.rol_empresa) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      })
      return
    }

    setInviting(true)
    
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', inviteForm.email)
        .single()

      if (existing) {
        throw new Error('Este usuario ya está registrado')
      }

      // Create registration link
      const registrationParams = new URLSearchParams({
        invited: 'true',
        area: inviteForm.area,
        role: inviteForm.rol_empresa,
        email: inviteForm.email
      })
      
      const registrationLink = `${window.location.origin}/landing?${registrationParams.toString()}`

      // Copy to clipboard
      await navigator.clipboard.writeText(registrationLink)

      toast({
        title: "✅ Invitación creada",
        description: `Link de registro copiado al portapapeles. Compártelo con ${inviteForm.email}`,
      })

      console.log('📧 Invitation link generated:', registrationLink)
      
      // Reset form and close modal
      setInviteForm({ email: '', area: '', rol_empresa: '' })
      setInviteModalOpen(false)
      
    } catch (error) {
      console.error('Invite error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setInviting(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_system: newRole })
        .eq('id', userId)

      if (error) {
        throw new Error(`Error actualizando rol: ${error.message}`)
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role_system: newRole } : u
      ))

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente"
      })

    } catch (error) {
      console.error('Role update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-900">Error al cargar usuarios</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button onClick={fetchUsers} className="mt-4" variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios de CEREBRO</p>
        </div>
        
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
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
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="area">Área</Label>
                <Select value={inviteForm.area} onValueChange={(value) => setInviteForm(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATC">ATC</SelectItem>
                    <SelectItem value="Operaciones">Operaciones</SelectItem>
                    <SelectItem value="Cumplimiento">Cumplimiento</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="RRHH">RRHH</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="role">Rol en la Empresa</Label>
                <Select value={inviteForm.rol_empresa} onValueChange={(value) => setInviteForm(prev => ({ ...prev, rol_empresa: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agente">Agente</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Analista">Analista</SelectItem>
                    <SelectItem value="Especialista">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={inviting} className="flex-1">
                  {inviting ? 'Creando invitación...' : 'Crear Invitación'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm text-gray-600">Activos Hoy</p>
                <p className="text-2xl font-bold">{users.filter(u => u.last_login && new Date(u.last_login).toDateString() === new Date().toDateString()).length}</p>
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
              <p className="text-gray-500 mb-4">Invita al primer usuario para comenzar</p>
              <Button onClick={() => setInviteModalOpen(true)} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Usuario
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                        {userProfile.role_system === 'admin' && (
                          <Badge className="bg-purple-600">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {userProfile.role_system === 'super_admin' && (
                          <Badge className="bg-red-600">
                            <Shield className="w-3 h-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
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
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {userProfile.last_login ? (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Último acceso</p>
                        <p className="text-xs">{new Date(userProfile.last_login).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Nunca</p>
                    )}
                    
                    {userProfile.email !== user?.email && (
                      <Select
                        value={userProfile.role_system}
                        onValueChange={(value) => updateUserRole(userProfile.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage
