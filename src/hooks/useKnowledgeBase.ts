
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  project: string
  tags: string[]
  file_url?: string
  active: boolean
  created_at: string
  created_by: string
}

export const useKnowledgeBase = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch knowledge base items
  const { data: items, isLoading } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as KnowledgeItem[]
    }
  })

  // Search knowledge base
  const searchKnowledgeBase = async (query: string) => {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title, content, project, tags')
      .eq('active', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5)
    
    if (error) throw error
    return data
  }

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, project, tags }: { 
      file: File
      project: string
      tags: string[]
    }) => {
      if (!user) throw new Error('Usuario no autenticado')

      // 1. Upload file to storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('retorna-files')
        .upload(`knowledge/${fileName}`, file)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('retorna-files')
        .getPublicUrl(`knowledge/${fileName}`)

      // 3. Extract text content (simplified)
      const textContent = await extractTextFromFile(file)

      // 4. Save to knowledge base
      const { data, error: dbError } = await supabase
        .from('knowledge_base')
        .insert({
          title: file.name,
          content: textContent,
          project: project || 'General',
          tags: tags,
          file_url: publicUrl,
          created_by: user.id,
          active: true
        })
        .select()
        .single()

      if (dbError) throw dbError
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Archivo subido",
        description: "El archivo ha sido procesado y agregado a la base de conocimiento."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Add manual content mutation
  const addContentMutation = useMutation({
    mutationFn: async ({ title, content, project, tags }: {
      title: string
      content: string
      project: string
      tags: string[]
    }) => {
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title,
          content,
          project: project || 'General',
          tags,
          created_by: user.id,
          active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Contenido agregado",
        description: "El contenido ha sido agregado a la base de conocimiento."
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Contenido eliminado",
        description: "El contenido ha sido eliminado de la base de conocimiento."
      })
    }
  })

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ active })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
      toast({
        title: "Estado actualizado",
        description: "El estado del contenido ha sido actualizado."
      })
    }
  })

  return {
    items,
    isLoading,
    searchKnowledgeBase,
    uploadFile: uploadFileMutation.mutate,
    addContent: addContentMutation.mutate,
    deleteItem: deleteMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    isUploading: uploadFileMutation.isPending,
    isAdding: addContentMutation.isPending
  }
}

// Text extraction helper (simplified)
const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'text/plain') {
    return await file.text()
  } else if (file.type === 'application/pdf') {
    return `Contenido del archivo PDF: ${file.name}`
  } else if (file.type.includes('word') || file.type.includes('document')) {
    return `Contenido del archivo Word: ${file.name}`
  } else if (file.type.includes('csv') || file.type.includes('excel')) {
    return `Contenido del archivo: ${file.name}`
  }
  return `Archivo: ${file.name} - Contenido no procesado automáticamente`
}
