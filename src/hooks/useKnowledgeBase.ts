
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
  const { user } = useAuth()

  // Fetch knowledge base items with better error handling
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching knowledge base items...')
      
      const { data, error, count } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Knowledge base fetch error:', error)
        throw new Error(`Error cargando knowledge base: ${error.message}`)
      }

      console.log('✅ Knowledge base loaded:', data?.length || 0, 'items')
      setItems(data || [])
      
      if ((data || []).length === 0) {
        console.log('📝 No knowledge base items found - this is normal for new installations')
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

  // Search knowledge base for AI context
  const searchKnowledgeBase = async (query: string) => {
    try {
      if (!query.trim()) return []

      console.log('🔍 Searching knowledge base for:', query)

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

      console.log('📚 Search results:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  // Add new knowledge base item
  const addItem = async (item: Omit<KnowledgeBase, 'id' | 'created_at' | 'created_by'>) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para agregar contenido",
          variant: "destructive"
        })
        return
      }

      console.log('📝 Adding knowledge base item:', item.title)

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          ...item,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding item:', error)
        throw new Error(`No se pudo agregar el elemento: ${error.message}`)
      }

      console.log('✅ Item added successfully:', data)
      setItems(prev => [data, ...prev])
      toast({
        title: "Éxito",
        description: "Elemento agregado correctamente"
      })

      return data
    } catch (error) {
      console.error('Add item error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Update knowledge base item
  const updateItem = async (id: string, updates: Partial<KnowledgeBase>) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating item:', error)
        throw new Error(`No se pudo actualizar el elemento: ${error.message}`)
      }

      setItems(prev => prev.map(item => item.id === id ? data : item))
      toast({
        title: "Éxito",
        description: "Elemento actualizado correctamente"
      })

      return data
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Toggle active status
  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ active })
        .eq('id', id)

      if (error) {
        console.error('Error toggling active:', error)
        throw new Error(`No se pudo cambiar el estado: ${error.message}`)
      }

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, active } : item
      ))

      toast({
        title: "Éxito",
        description: `Elemento ${active ? 'activado' : 'desactivado'} correctamente`
      })
    } catch (error) {
      console.error('Toggle error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Delete knowledge base item
  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting item:', error)
        throw new Error(`No se pudo eliminar el elemento: ${error.message}`)
      }

      setItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: "Éxito",
        description: "Elemento eliminado correctamente"
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

  // Upload file with improved error handling
  const uploadFile = async (file: File, metadata: {
    title: string
    project: string
    tags: string[]
  }) => {
    try {
      setIsUploading(true)

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`Archivo ${file.name} muy grande (máximo 10MB)`)
      }

      console.log(`📁 Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

      // Upload to storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `knowledge/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('retorna-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Storage upload failed:', uploadError)
        throw new Error(`Error subiendo archivo: ${uploadError.message}`)
      }

      // Extract text content
      const textContent = await extractTextFromFile(file)

      // Save to knowledge base
      const newItem = await addItem({
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
        content: textContent,
        project: metadata.project,
        tags: metadata.tags,
        file_url: uploadData.path,
        active: true
      })

      console.log('✅ File uploaded and processed successfully')
      return newItem

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type === 'text/plain') {
        return await file.text()
      } else if (file.type === 'text/csv') {
        const text = await file.text()
        return `Datos CSV:\n${text}`
      } else if (file.type === 'application/json') {
        const text = await file.text()
        return `Datos JSON:\n${text}`
      } else {
        return `Documento: ${file.name}\nTipo: ${file.type}\nTamaño: ${(file.size / 1024).toFixed(1)}KB\n\nContenido será procesado por el administrador.`
      }
    } catch (error) {
      console.warn('Text extraction failed:', error)
      return `Archivo: ${file.name} - requiere procesamiento manual`
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
    deleteItem,
    uploadFile
  }
}
