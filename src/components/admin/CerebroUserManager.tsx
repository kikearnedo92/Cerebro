import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CerebroUser {
  id: string;
  email: string;
  full_name: string;
  role_system: string;
  can_access_cerebro: boolean;
  can_access_nucleo: boolean;
  created_at: string;
  last_login?: string;
}

export default function CerebroUserManager() {
  const [users, setUsers] = useState<CerebroUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CerebroUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role_system: 'user',
    can_access_cerebro: true,
    can_access_nucleo: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role_system: formData.role_system,
            can_access_cerebro: formData.can_access_cerebro,
            can_access_nucleo: formData.can_access_nucleo
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario se han actualizado correctamente"
        });
      } else {
        // Create new user - this would typically be done through Supabase Auth
        toast({
          title: "Crear usuario",
          description: "La creación de usuarios debe realizarse a través del sistema de autenticación",
          variant: "destructive"
        });
        return;
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: CerebroUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role_system: user.role_system,
      can_access_cerebro: user.can_access_cerebro,
      can_access_nucleo: user.can_access_nucleo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente"
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const toggleAccess = async (userId: string, accessType: 'cerebro' | 'nucleo', currentValue: boolean) => {
    try {
      const updateData = accessType === 'cerebro' 
        ? { can_access_cerebro: !currentValue }
        : { can_access_nucleo: !currentValue };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Acceso actualizado",
        description: `Acceso a ${accessType} ${!currentValue ? 'activado' : 'desactivado'}`
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating access:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el acceso",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role_system: 'user',
      can_access_cerebro: true,
      can_access_nucleo: false
    });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🛡️ Gestión de Usuarios Cerebro
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingUser(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role_system">Rol</Label>
                    <Select value={formData.role_system} onValueChange={(value) => setFormData({ ...formData, role_system: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_access_cerebro"
                      checked={formData.can_access_cerebro}
                      onChange={(e) => setFormData({ ...formData, can_access_cerebro: e.target.checked })}
                    />
                    <Label htmlFor="can_access_cerebro">Acceso a Cerebro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="can_access_nucleo"
                      checked={formData.can_access_nucleo}
                      onChange={(e) => setFormData({ ...formData, can_access_nucleo: e.target.checked })}
                    />
                    <Label htmlFor="can_access_nucleo">Acceso a Núcleo</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Accesos</TableHead>
                <TableHead>Último Login</TableHead>
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
                    <Badge className={getRoleColor(user.role_system)}>
                      {user.role_system}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={user.can_access_cerebro ? "default" : "outline"}
                        onClick={() => toggleAccess(user.id, 'cerebro', user.can_access_cerebro)}
                        className="text-xs"
                      >
                        {user.can_access_cerebro ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        Cerebro
                      </Button>
                      <Button
                        size="sm"
                        variant={user.can_access_nucleo ? "default" : "outline"}
                        onClick={() => toggleAccess(user.id, 'nucleo', user.can_access_nucleo)}
                        className="text-xs"
                      >
                        {user.can_access_nucleo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        Núcleo
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}