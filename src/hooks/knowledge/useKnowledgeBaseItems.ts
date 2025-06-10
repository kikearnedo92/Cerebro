
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useKnowledgeBaseItems = (
  items: KnowledgeBase[],
  setItems: React.Dispatch<React.SetStateAction<KnowledgeBase[]>>
) => {
  const { user, isAdmin } = useAuth()

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

  return {
    addItem,
    updateItem,
    toggleActive,
    deleteItem
  }
}
