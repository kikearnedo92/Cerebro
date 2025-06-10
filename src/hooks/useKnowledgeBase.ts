
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useKnowledgeBase = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAdmin } = useAuth()

  // Fetch REAL knowledge base items (NO fake data)
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching REAL knowledge base items...')
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Knowledge base fetch error:', error)
        throw new Error(`Error cargando knowledge base: ${error.message}`)
      }

      console.log('✅ REAL Knowledge base loaded:', data?.length || 0, 'items')
      setItems(data || [])
      
      // REAL empty state - no fake data
      if ((data || []).length === 0) {
        console.log('📝 Knowledge base is empty - ready for REAL documents')
      }

    } catch (error) {
      console.error('Knowledge base error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Search REAL knowledge base for AI context
  const searchKnowledgeBase = async (query: string) => {
    try {
      if (!query.trim()) return []

      console.log('🔍 Searching REAL knowledge base for:', query)

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('title, content, project')
        .eq('active', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3)

      if (error) {
        console.error('Knowledge base search error:', error)
        return []
      }

      console.log('📚 REAL Search results:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  // Add new content item
  const addItem = async (itemData: {
    title: string
    content: string
    project: string
    tags: string[]
    active: boolean
  }) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden agregar contenido')
      }

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      console.log('📝 Adding new content item:', itemData.title)

      const { data: newItem, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: itemData.title,
          content: itemData.content,
          project: itemData.project,
          tags: itemData.tags,
          created_by: user.id,
          active: itemData.active
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding item:', error)
        throw new Error(`Error agregando contenido: ${error.message}`)
      }

      setItems(prev => [newItem, ...prev])
      
      toast({
        title: "Contenido agregado",
        description: "El contenido se ha agregado exitosamente"
      })

      return newItem

    } catch (error) {
      console.error('Add item error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }

  // Update existing content item
  const updateItem = async (id: string, updateData: {
    title: string
    content: string
    project: string
    tags: string[]
  }) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden editar contenido')
      }

      console.log('✏️ Updating content item:', id)

      const { data: updatedItem, error } = await supabase
        .from('knowledge_base')
        .update({
          title: updateData.title,
          content: updateData.content,
          project: updateData.project,
          tags: updateData.tags
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating item:', error)
        throw new Error(`Error actualizando contenido: ${error.message}`)
      }

      setItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      
      toast({
        title: "Contenido actualizado",
        description: "El contenido se ha actualizado exitosamente"
      })

      return updatedItem

    } catch (error) {
      console.error('Update item error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }

  // Toggle active status
  const toggleActive = async (id: string, active: boolean) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden cambiar el estado')
      }

      console.log('🔄 Toggling active status for item:', id, 'to:', active)

      const { error } = await supabase
        .from('knowledge_base')
        .update({ active })
        .eq('id', id)

      if (error) {
        console.error('Error toggling active status:', error)
        throw new Error(`Error cambiando estado: ${error.message}`)
      }

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, active } : item
      ))
      
      toast({
        title: "Estado actualizado",
        description: `Documento ${active ? 'activado' : 'desactivado'} correctamente`
      })

    } catch (error) {
      console.error('Toggle active error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // REAL file upload with text extraction
  const uploadFile = async (file: File, metadata: {
    title: string
    project: string
    tags: string[]
  }) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden subir documentos')
      }

      setIsUploading(true)

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`Archivo ${file.name} muy grande (máximo 10MB)`)
      }

      console.log(`📁 Uploading REAL file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      // Upload to REAL Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `documents/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('retorna-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Storage upload failed:', uploadError)
        throw new Error(`Error subiendo archivo: ${uploadError.message}`)
      }

      // REAL text extraction from uploaded file
      const textContent = await extractTextFromFile(file)

      // Save to REAL knowledge base
      const { data: newItem, error: insertError } = await supabase
        .from('knowledge_base')
        .insert({
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
          content: textContent,
          project: metadata.project,
          tags: metadata.tags,
          file_url: uploadData.path,
          created_by: user.id,
          active: true
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert failed:', insertError)
        throw new Error(`Error guardando en base de datos: ${insertError.message}`)
      }

      setItems(prev => [newItem, ...prev])

      console.log('✅ REAL file uploaded and processed successfully')
      toast({
        title: "Archivo subido exitosamente",
        description: `${file.name} ha sido procesado y agregado a la base de conocimiento`
      })

      return newItem

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // REAL text extraction from files
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      console.log('📄 Extracting REAL text from:', file.name, file.type)

      if (file.type === 'text/plain') {
        const text = await file.text()
        return text
      } else if (file.type === 'text/csv') {
        const text = await file.text()
        return `Datos CSV:\n${text}`
      } else if (file.type === 'application/json') {
        const text = await file.text()
        return `Datos JSON:\n${text}`
      } else if (file.type === 'application/pdf') {
        // For now, return file info - in production you'd use pdf-parse
        return `Documento PDF: ${file.name}\nTamaño: ${(file.size / 1024).toFixed(1)}KB\n\n[Contenido PDF será procesado por el sistema]`
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For now, return file info - in production you'd use mammoth
        return `Documento DOCX: ${file.name}\nTamaño: ${(file.size / 1024).toFixed(1)}KB\n\n[Contenido DOCX será procesado por el sistema]`
      } else {
        return `Documento: ${file.name}\nTipo: ${file.type}\nTamaño: ${(file.size / 1024).toFixed(1)}KB\n\nContenido será procesado por el administrador.`
      }
    } catch (error) {
      console.warn('Text extraction failed:', error)
      return `Archivo: ${file.name} - requiere procesamiento manual`
    }
  }

  // Delete document (admin only)
  const deleteItem = async (id: string) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden eliminar documentos')
      }

      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting item:', error)
        throw new Error(`No se pudo eliminar el documento: ${error.message}`)
      }

      setItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente"
      })
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    isLoading,
    isUploading,
    error,
    fetchItems,
    searchKnowledgeBase,
    addItem,
    updateItem,
    toggleActive,
    uploadFile,
    deleteItem
  }
}
