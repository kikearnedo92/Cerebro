import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Users, MessageSquare, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ContactInfo {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone?: string
  escalation_priority: number
}

interface ResponseTemplate {
  id: string
  category: string
  title: string
  template: string
  usage_count: number
}

const PersonalitySettingsPage = () => {
  const { toast } = useToast()
  const [systemPrompt, setSystemPrompt] = useState('')
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [newContact, setNewContact] = useState<Partial<ContactInfo>>({})
  const [newTemplate, setNewTemplate] = useState<Partial<ResponseTemplate>>({})

  useEffect(() => {
    loadPersonalitySettings()
  }, [])

  const loadPersonalitySettings = async () => {
    try {
      // Load current system prompt from company config
      const { data: config } = await supabase
        .from('company_config')
        .select('system_prompt')
        .single()

      if (config) {
        setSystemPrompt(config.system_prompt)
      }

      // Load contacts and templates (mock data for now)
      setContacts([
        {
          id: '1',
          name: 'Joel Martinez',
          role: 'Tesorero',
          department: 'Tesorería',
          email: 'joel@retorna.app',
          phone: '+57 300 123 4567',
          escalation_priority: 1
        },
        {
          id: '2',
          name: 'María Rodriguez',
          role: 'Customer Success Manager',
          department: 'Atención al Cliente',
          email: 'maria@retorna.app',
          escalation_priority: 2
        },
        {
          id: '3',
          name: 'Carlos Mendez',
          role: 'Tech Lead',
          department: 'Tecnología',
          email: 'carlos@retorna.app',
          escalation_priority: 3
        }
      ])

      setTemplates([
        {
          id: '1',
          category: 'Tesorería',
          title: 'Consulta de saldos',
          template: 'Para consultas sobre saldos y movimientos de tesorería, por favor contacta a Joel Martinez (joel@retorna.app). Él puede ayudarte con: \n- Revisión de saldos\n- Movimientos pendientes\n- Conciliaciones bancarias',
          usage_count: 45
        },
        {
          id: '2',
          category: 'Soporte Técnico',
          title: 'Error en transferencias',
          template: 'Si experimentas problemas técnicos con las transferencias, nuestro equipo de tecnología puede ayudarte. Contacta a Carlos Mendez (carlos@retorna.app) proporcionando:\n- ID de la transacción\n- Descripción del error\n- Hora aproximada del incidente',
          usage_count: 32
        }
      ])

    } catch (error) {
      console.error('Error loading personality settings:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSystemPrompt = async () => {
    try {
      const { error } = await supabase
        .from('company_config')
        .update({ system_prompt: systemPrompt })
        .eq('id', (await supabase.from('company_config').select('id').single()).data?.id)

      if (error) throw error

      toast({
        title: 'Éxito',
        description: 'Prompt del sistema actualizado correctamente'
      })
    } catch (error) {
      console.error('Error updating system prompt:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el prompt del sistema',
        variant: 'destructive'
      })
    }
  }

  const addContact = () => {
    if (newContact.name && newContact.role && newContact.email) {
      const contact: ContactInfo = {
        id: Date.now().toString(),
        name: newContact.name!,
        role: newContact.role!,
        department: newContact.department || '',
        email: newContact.email!,
        phone: newContact.phone,
        escalation_priority: newContact.escalation_priority || contacts.length + 1
      }
      setContacts([...contacts, contact])
      setNewContact({})
      toast({
        title: 'Contacto agregado',
        description: `${contact.name} ha sido agregado al directorio`
      })
    }
  }

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id))
    toast({
      title: 'Contacto eliminado',
      description: 'El contacto ha sido removido del directorio'
    })
  }

  const addTemplate = () => {
    if (newTemplate.title && newTemplate.template && newTemplate.category) {
      const template: ResponseTemplate = {
        id: Date.now().toString(),
        category: newTemplate.category!,
        title: newTemplate.title!,
        template: newTemplate.template!,
        usage_count: 0
      }
      setTemplates([...templates, template])
      setNewTemplate({})
      toast({
        title: 'Template agregado',
        description: `Template "${template.title}" creado exitosamente`
      })
    }
  }

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id))
    toast({
      title: 'Template eliminado',
      description: 'El template ha sido removido'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Configuración de Personalidad</h1>
        <p className="text-purple-600">Personaliza la forma en que CEREBRO interactúa y escalona consultas</p>
      </div>

      <Tabs defaultValue="prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contactos
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt del Sistema</CardTitle>
              <CardDescription>
                Define la personalidad y comportamiento de CEREBRO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="system-prompt">Prompt del Sistema</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={12}
                  className="mt-2"
                  placeholder="Eres CEREBRO, el asistente inteligente de Retorna..."
                />
              </div>
              <Button onClick={updateSystemPrompt} className="w-full">
                Actualizar Prompt del Sistema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Directorio de Contactos</CardTitle>
              <CardDescription>
                Gestiona los contactos de Retorna para el sistema de escalación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Input
                  placeholder="Nombre completo"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
                <Input
                  placeholder="Cargo"
                  value={newContact.role || ''}
                  onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                />
                <Input
                  placeholder="Departamento"
                  value={newContact.department || ''}
                  onChange={(e) => setNewContact({...newContact, department: e.target.value})}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newContact.email || ''}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
                <Input
                  placeholder="Teléfono (opcional)"
                  value={newContact.phone || ''}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
                <Button onClick={addContact} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg bg-purple-50/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-purple-900">{contact.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Prioridad {contact.escalation_priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-600">{contact.department} • {contact.email}</p>
                      {contact.phone && <p className="text-sm text-purple-500">{contact.phone}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(contact.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Respuesta</CardTitle>
              <CardDescription>
                Configura respuestas predefinidas para consultas comunes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Categoría"
                    value={newTemplate.category || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  />
                  <Input
                    placeholder="Título del template"
                    value={newTemplate.title || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  />
                </div>
                <Textarea
                  placeholder="Contenido del template..."
                  value={newTemplate.template || ''}
                  onChange={(e) => setNewTemplate({...newTemplate, template: e.target.value})}
                  rows={4}
                />
                <Button onClick={addTemplate} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Template
                </Button>
              </div>

              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 bg-purple-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-purple-900">{template.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.usage_count} usos
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(template.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-purple-600 whitespace-pre-line">{template.template}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PersonalitySettingsPage