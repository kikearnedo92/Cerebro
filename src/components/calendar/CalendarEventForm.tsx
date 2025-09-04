import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Calendar, Clock, MapPin, Users, Plus, X } from 'lucide-react'

interface CalendarEvent {
  id?: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  organizer_id: string
  participants?: { user_id: string; status: string }[]
}

interface User {
  id: string
  full_name: string
  email: string
}

interface CalendarEventFormProps {
  event?: CalendarEvent
  onEventCreated?: (event: CalendarEvent) => void
  onEventUpdated?: (event: CalendarEvent) => void
  children: React.ReactNode
}

export const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  event,
  onEventCreated,
  onEventUpdated,
  children
}) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    event?.participants?.map(p => p.user_id) || []
  )
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_at: event?.start_at ? new Date(event.start_at).toISOString().slice(0, 16) : '',
    end_at: event?.end_at ? new Date(event.end_at).toISOString().slice(0, 16) : '',
    location: event?.location || ''
  })

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const eventData = {
        ...formData,
        organizer_id: user.id,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString()
      }

      if (event) {
        // Update existing event
        const { data, error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single()

        if (error) throw error

        // Update participants
        if (selectedParticipants.length > 0) {
          // Remove existing participants
          await supabase
            .from('calendar_event_participants')
            .delete()
            .eq('event_id', event.id)

          // Add new participants
          const participantData = selectedParticipants.map(userId => ({
            event_id: event.id,
            user_id: userId,
            status: 'invited'
          }))

          await supabase
            .from('calendar_event_participants')
            .insert(participantData)
        }

        onEventUpdated?.(data)
        toast({
          title: "Evento actualizado",
          description: "El evento se ha actualizado correctamente"
        })
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('calendar_events')
          .insert(eventData)
          .select()
          .single()

        if (error) throw error

        // Add participants
        if (selectedParticipants.length > 0) {
          const participantData = selectedParticipants.map(userId => ({
            event_id: data.id,
            user_id: userId,
            status: 'invited'
          }))

          await supabase
            .from('calendar_event_participants')
            .insert(participantData)
        }

        onEventCreated?.(data)
        toast({
          title: "Evento creado",
          description: "El evento se ha creado correctamente"
        })
      }

      setOpen(false)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        location: ''
      })
      setSelectedParticipants([])
      
    } catch (error: any) {
      console.error('Error saving event:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el evento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={loadUsers}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {event ? 'Editar Evento' : 'Crear Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del evento"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ubicación del evento"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del evento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_at">Inicio *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_at">Fin *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participantes
            </Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-sm text-gray-500">Cargando usuarios...</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedParticipants.includes(user.id)
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleParticipant(user.id)}
                    >
                      <div>
                        <p className="font-medium text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {selectedParticipants.includes(user.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Invitado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedParticipants.length} participante(s) seleccionado(s)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : event ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}