import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type Empleado } from '@/types/equipo';

interface StaffEditorProps {
  staff: Empleado[];
  onUpdateStaff: (updatedStaff: Empleado[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffEditor: React.FC<StaffEditorProps> = ({ 
  staff, 
  onUpdateStaff, 
  open, 
  onOpenChange 
}) => {
  const [editingStaff, setEditingStaff] = useState<Empleado[]>(staff);

  const updateStaffMember = (id: string, field: keyof Empleado, value: any) => {
    setEditingStaff(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const handleSave = () => {
    onUpdateStaff(editingStaff);
    onOpenChange(false);
  };

  const addNewStaffMember = () => {
    const newId = `staff_${Date.now()}`;
    const newStaff: Empleado = {
      id: newId,
      nombre: 'Nuevo Empleado',
      pais: 'Colombia',
      departamento: 'ATC',
      tipo: 'Regular',
      horasMax: 44,
      lider: 'Edison',
      especialidad: 'ATC',
      horasAsignadas: 0,
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      nivel: 'Junior'
    };
    setEditingStaff(prev => [...prev, newStaff]);
  };

  const removeStaffMember = (id: string) => {
    setEditingStaff(prev => prev.filter(member => member.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Personal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button onClick={addNewStaffMember} className="mb-4">
            Agregar Nuevo Personal
          </Button>
          
          {editingStaff.map(member => (
            <div key={member.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre</label>
                  <Input
                    value={member.nombre}
                    onChange={(e) => updateStaffMember(member.id, 'nombre', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">País</label>
                  <Select 
                    value={member.pais} 
                    onValueChange={(value) => updateStaffMember(member.id, 'pais', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venezuela">Venezuela</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="México">México</SelectItem>
                      <SelectItem value="Italia">Italia</SelectItem>
                      <SelectItem value="Europa">Europa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Departamento</label>
                  <Select 
                    value={member.departamento} 
                    onValueChange={(value) => updateStaffMember(member.id, 'departamento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATC">ATC</SelectItem>
                      <SelectItem value="ONB">ONB</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Horas Máximas</label>
                  <Input
                    type="number"
                    min="1"
                    max="48"
                    value={member.horasMax}
                    onChange={(e) => updateStaffMember(member.id, 'horasMax', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Nivel</label>
                  <Select 
                    value={member.nivel} 
                    onValueChange={(value) => updateStaffMember(member.id, 'nivel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Semi-Senior">Semi-Senior</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge variant={member.departamento === 'ATC' ? 'default' : 'secondary'}>
                      {member.departamento}
                    </Badge>
                    <Badge variant={member.nivel === 'Senior' ? 'destructive' : 'outline'}>
                      {member.nivel}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStaffMember(member.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};