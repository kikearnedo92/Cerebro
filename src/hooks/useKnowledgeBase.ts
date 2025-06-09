
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useKnowledgeBase = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()

  // Fetch knowledge base items
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching knowledge base:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los elementos de la base de conocimiento",
          variant: "destructive"
        })
        return
      }

      setItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Search knowledge base for AI context
  const searchKnowledgeBase = async (query: string) => {
    try {
      if (!query.trim()) return []

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
        toast({
          title: "Error",
          description: "No se pudo agregar el elemento",
          variant: "destructive"
        })
        return
      }

      setItems(prev => [data, ...prev])
      toast({
        title: "Éxito",
        description: "Elemento agregado correctamente"
      })

      return data
    } catch (error) {
      console.error('Error:', error)
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
        toast({
          title: "Error",
          description: "No se pudo actualizar el elemento",
          variant: "destructive"
        })
        return
      }

      setItems(prev => prev.map(item => item.id === id ? data : item))
      toast({
        title: "Éxito",
        description: "Elemento actualizado correctamente"
      })

      return data
    } catch (error) {
      console.error('Error:', error)
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
        toast({
          title: "Error",
          description: "No se pudo cambiar el estado",
          variant: "destructive"
        })
        return
      }

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, active } : item
      ))

      toast({
        title: "Éxito",
        description: `Elemento ${active ? 'activado' : 'desactivado'} correctamente`
      })
    } catch (error) {
      console.error('Error:', error)
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
        toast({
          title: "Error",
          description: "No se pudo eliminar el elemento",
          variant: "destructive"
        })
        return
      }

      setItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: "Éxito",
        description: "Elemento eliminado correctamente"
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Upload file
  const uploadFile = async (file: File, metadata: {
    title: string
    project: string
    tags: string[]
  }) => {
    try {
      setIsUploading(true)

      // Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `knowledge/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('retorna-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast({
          title: "Error",
          description: "No se pudo subir el archivo",
          variant: "destructive"
        })
        return
      }

      // For now, use filename as content until we implement text extraction
      const newItem = await addItem({
        title: metadata.title || file.name,
        content: `Archivo subido: ${file.name}`,
        project: metadata.project,
        tags: metadata.tags,
        file_url: uploadData.path,
        active: true
      })

      return newItem
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    isLoading,
    isUploading,
    fetchItems,
    searchKnowledgeBase,
    addItem,
    updateItem,
    toggleActive,
    deleteItem,
    uploadFile
  }
}
