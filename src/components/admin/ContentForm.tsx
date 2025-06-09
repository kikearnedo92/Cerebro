
import React, { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

interface ContentFormProps {
  content?: any
  onClose: () => void
  onSave: () => void
}

const ContentForm: React.FC<ContentFormProps> = ({ content, onClose, onSave }) => {
  const [title, setTitle] = useState('')
  const [contentText, setContentText] = useState('')
  const [project, setProject] = useState('')
  const [tags, setTags] = useState('')
  const [active, setActive] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (content) {
      setTitle(content.title || '')
      setContentText(content.content || '')
      setProject(content.project || '')
      setTags(content.tags?.join(', ') || '')
      setActive(content.active ?? true)
    }
  }, [content])

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      const tagsArray = formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      
      const data = {
        title: formData.title,
        content: formData.content,
        project: formData.project || 'General',
        tags: tagsArray,
        active: formData.active,
        created_by: user?.id
      }

      if (content) {
        // Update existing
        const { error } = await supabase
          .from('knowledge_base')
          .update(data)
          .eq('id', content.id)
        
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('knowledge_base')
          .insert(data)
        
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast({
        title: content ? "Contenido actualizado" : "Contenido creado",
        description: "El contenido ha sido guardado correctamente."
      })
      onSave()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !contentText.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y contenido.",
        variant: "destructive"
      })
      return
    }

    saveMutation.mutate({
      title: title.trim(),
      content: contentText.trim(),
      project: project.trim(),
      tags: tags.trim(),
      active
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {content ? 'Editar Contenido' : 'Agregar Contenido'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del contenido"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Contenido detallado..."
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project">Proyecto</Label>
              <Input
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Ej: ATC, Research, Onboarding..."
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (separados por comas)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej: política, procedimiento, FAQ..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="active">Contenido activo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ContentForm
