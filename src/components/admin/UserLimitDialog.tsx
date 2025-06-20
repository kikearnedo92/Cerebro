
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface UserLimitDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    full_name: string
    email: string
    daily_query_limit: number
  } | null
  onUserUpdated: () => void
}

const UserLimitDialog: React.FC<UserLimitDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUserUpdated
}) => {
  const [newLimit, setNewLimit] = useState(user?.daily_query_limit || 50)

  const handleUpdateLimit = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_query_limit: newLimit })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Límite actualizado",
        description: `Límite de consultas diarias actualizado a ${newLimit} para ${user.full_name}`,
      })

      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating limit:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el límite",
        variant: "destructive"
      })
    }
  }

  React.useEffect(() => {
    if (user) {
      setNewLimit(user.daily_query_limit)
    }
  }, [user])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modificar Límite de Consultas</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Usuario: <span className="font-medium">{user.full_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Email: <span className="font-medium">{user.email}</span>
              </p>
            </div>
            
            <div>
              <Label htmlFor="limit">Límite diario de consultas</Label>
              <Input
                id="limit"
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                min="0"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Límite actual: {user.daily_query_limit} consultas por día
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateLimit} className="flex-1">
                Actualizar Límite
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserLimitDialog
