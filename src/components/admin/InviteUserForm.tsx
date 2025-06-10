
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

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

const ROLES_EMPRESA = [
  'Agente',
  'Analista',
  'Manager',
  'Director'
]

interface InviteUserFormProps {
  onClose: () => void
  onSuccess: () => void
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [area, setArea] = useState('')
  const [rolEmpresa, setRolEmpresa] = useState('')
  const { user } = useAuth()

  const inviteMutation = useMutation({
    mutationFn: async (formData: any) => {
      console.log('📧 Sending REAL invitation email to Retorna employee...')
      
      // Call the REAL send-invitation edge function
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: formData.email,
          fullName: formData.fullName,
          area: formData.area,
          rolEmpresa: formData.rolEmpresa,
          invitedBy: user?.id,
          company: 'Retorna'
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: (data) => {
      toast({
        title: "Usuario invitado exitosamente",
        description: `Se ha enviado una invitación REAL a ${data.email} para unirse a Retorna en Cerebro.`,
        duration: 10000
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error al invitar usuario",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !fullName.trim() || !area || !rolEmpresa) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive"
      })
      return
    }

    if (!email.endsWith('@retorna.app')) {
      toast({
        title: "Email inválido",
        description: "Solo se permiten emails con dominio @retorna.app",
        variant: "destructive"
      })
      return
    }

    inviteMutation.mutate({
      email: email.trim(),
      fullName: fullName.trim(),
      area,
      rolEmpresa
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Usuario - Retorna</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@retorna.app"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo emails con dominio @retorna.app
            </p>
          </div>

          <div>
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <Label htmlFor="area">Área de Retorna *</Label>
            <Select value={area} onValueChange={setArea} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                {RETORNA_AREAS.map(areaOption => (
                  <SelectItem key={areaOption} value={areaOption}>{areaOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rolEmpresa">Rol en empresa *</Label>
            <Select value={rolEmpresa} onValueChange={setRolEmpresa} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES_EMPRESA.map(rol => (
                  <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Enviando invitación real...' : 'Enviar Invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUserForm
