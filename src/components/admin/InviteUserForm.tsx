
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface InviteUserFormProps {
  onClose: () => void
  onSuccess: () => void
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [area, setArea] = useState('')
  const [rolEmpresa, setRolEmpresa] = useState('')

  const inviteMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Validate email domain
      if (!formData.email.endsWith('@retorna.app')) {
        throw new Error('Solo se permiten emails con dominio @retorna.app')
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

      // Create user account
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.fullName,
            area: formData.area,
            rol_empresa: formData.rolEmpresa
          }
        }
      })

      if (signUpError) throw signUpError

      return { email: formData.email, tempPassword }
    },
    onSuccess: (data) => {
      toast({
        title: "Usuario invitado",
        description: `Se ha enviado una invitación a ${data.email}. Password temporal: ${data.tempPassword}`,
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
          <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
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
            <Label htmlFor="area">Área *</Label>
            <Select value={area} onValueChange={setArea} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATC">ATC</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Onboarding">Onboarding</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
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
                <SelectItem value="Agente">Agente</SelectItem>
                <SelectItem value="Analista">Analista</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Director">Director</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUserForm
