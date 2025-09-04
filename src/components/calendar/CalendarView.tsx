import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { CalendarEventForm } from './CalendarEventForm'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  Users,
  Edit,
  Trash2
} from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  organizer_id: string
  participants?: { user_id: string; status: string; user?: { full_name: string; email: string } }[]
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const CalendarView: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, currentDate])

  const loadEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get first and last day of current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data, error } = await supabase
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
        .gte('start_at', firstDay.toISOString())
        .lte('start_at', lastDay.toISOString())
        .order('start_at')

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
    } catch (error: any) {
      console.error('Error loading events:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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
    } catch (error: any) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      })
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDay = (date: Date | null) => {
    if (!date) return []
    
    return events.filter(event => {
      const eventDate = new Date(event.start_at)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const canEditEvent = (event: CalendarEvent) => {
    return user?.id === event.organizer_id
  }

  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h1 className="text-2xl font-bold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <CalendarEventForm onEventCreated={loadEvents}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        </CalendarEventForm>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday Headers */}
              {WEEKDAYS.map(day => (
                <div
                  key={day}
                  className="p-2 text-center font-medium text-sm text-gray-600 border-b"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {days.map((date, index) => {
                const dayEvents = getEventsForDay(date)
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-1 border border-gray-200 ${
                      date ? 'bg-white' : 'bg-gray-50'
                    } ${isToday(date) ? 'ring-2 ring-primary ring-inset' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(date) ? 'text-primary' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="group relative"
                            >
                              <div className="text-xs p-1 bg-primary/10 text-primary rounded truncate cursor-pointer hover:bg-primary/20 transition-colors">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(event.start_at)}
                                </div>
                                <div className="font-medium truncate">{event.title}</div>
                              </div>
                              
                              {/* Event details on hover */}
                              <div className="absolute left-0 top-full mt-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <Card className="w-64 shadow-lg">
                                  <CardContent className="p-3">
                                    <div className="space-y-2">
                                      <div>
                                        <p className="font-medium">{event.title}</p>
                                        {event.description && (
                                          <p className="text-sm text-gray-600">{event.description}</p>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(event.start_at)} - {formatTime(event.end_at)}
                                      </div>
                                      
                                      {event.location && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <MapPin className="w-3 h-3" />
                                          {event.location}
                                        </div>
                                      )}
                                      
                                      {event.participants && event.participants.length > 0 && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <Users className="w-3 h-3" />
                                          {event.participants.length} participante(s)
                                        </div>
                                      )}
                                      
                                      {canEditEvent(event) && (
                                        <div className="flex gap-1 pt-2 border-t">
                                          <CalendarEventForm
                                            event={event}
                                            onEventUpdated={loadEvents}
                                          >
                                            <Button size="sm" variant="outline" className="flex-1">
                                              <Edit className="w-3 h-3 mr-1" />
                                              Editar
                                            </Button>
                                          </CalendarEventForm>
                                          
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteEvent(event.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          ))}
                          
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay eventos programados para este mes
            </p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{event.title}</p>
                      {canEditEvent(event) && (
                        <Badge variant="outline" className="text-xs">
                          Organizador
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.start_at).toLocaleDateString('es-ES')} {formatTime(event.start_at)}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.participants && event.participants.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.participants.length}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canEditEvent(event) && (
                    <div className="flex gap-1">
                      <CalendarEventForm
                        event={event}
                        onEventUpdated={loadEvents}
                      >
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </CalendarEventForm>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}