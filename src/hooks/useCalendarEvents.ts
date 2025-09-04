import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  organizer_id: string
  participants?: {
    user_id: string
    status: string
    user?: {
      full_name: string
      email: string
    }
  }[]
}

export const useCalendarEvents = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  const loadEvents = async (startDate?: Date, endDate?: Date) => {
    if (!user) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          calendar_event_participants (
            user_id,
            status,
            profiles:user_id (
              full_name,
              email
            )
          )
        `)
        .order('start_at')

      if (startDate) {
        query = query.gte('start_at', startDate.toISOString())
      }
      
      if (endDate) {
        query = query.lte('start_at', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      const eventsWithParticipants = data?.map(event => ({
        ...event,
        participants: event.calendar_event_participants?.map((p: any) => ({
          user_id: p.user_id,
          status: p.status,
          user: p.profiles
        }))
      })) || []

      setEvents(eventsWithParticipants)
      return eventsWithParticipants
    } catch (error: any) {
      console.error('Error loading events:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive"
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'organizer_id'>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          organizer_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      await loadEvents() // Reload all events
      
      toast({
        title: "Evento creado",
        description: "El evento se ha creado correctamente"
      })

      return data
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive"
      })
      return null
    }
  }

  const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error

      await loadEvents() // Reload all events
      
      toast({
        title: "Evento actualizado",
        description: "El evento se ha actualizado correctamente"
      })

      return data
    } catch (error: any) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(prev => prev.filter(e => e.id !== eventId))
      
      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente"
      })

      return true
    } catch (error: any) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      })
      return false
    }
  }

  const addParticipants = async (eventId: string, userIds: string[]) => {
    try {
      const participantData = userIds.map(userId => ({
        event_id: eventId,
        user_id: userId,
        status: 'invited'
      }))

      const { error } = await supabase
        .from('calendar_event_participants')
        .insert(participantData)

      if (error) throw error

      await loadEvents() // Reload all events
      
      toast({
        title: "Participantes añadidos",
        description: "Los participantes se han añadido correctamente"
      })

      return true
    } catch (error: any) {
      console.error('Error adding participants:', error)
      toast({
        title: "Error",
        description: "No se pudieron añadir los participantes",
        variant: "destructive"
      })
      return false
    }
  }

  const updateParticipantStatus = async (eventId: string, userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('calendar_event_participants')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (error) throw error

      await loadEvents() // Reload all events
      
      toast({
        title: "Estado actualizado",
        description: "El estado del participante se ha actualizado"
      })

      return true
    } catch (error: any) {
      console.error('Error updating participant status:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      })
      return false
    }
  }

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    addParticipants,
    updateParticipantStatus
  }
}