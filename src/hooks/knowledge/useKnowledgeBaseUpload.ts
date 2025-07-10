
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useKnowledgeBaseUpload = (
  setItems: React.Dispatch<React.SetStateAction<KnowledgeBase[]>>
) => {
  const [isUploading, setIsUploading] = useState(false)
  const { user, isAdmin } = useAuth()

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

      console.log('✅ File uploaded to storage, processing with AI...')

      // Process file with REAL edge function
      const { data: processData, error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: `${supabase.storage.from('retorna-files').getPublicUrl(uploadData.path).data.publicUrl}`,
          fileName: file.name,
          fileType: file.type,
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
          project: metadata.project,
          tags: metadata.tags,
          userId: user.id
        }
      })

      if (processError) {
        console.error('Document processing failed:', processError)
        throw new Error(`Error procesando documento: ${processError.message}`)
      }

      console.log('✅ REAL file uploaded and processed successfully')
      console.log('Process response:', processData)
      
      // Refresh the knowledge base data
      window.location.reload() // Simple refresh for now, will improve with real-time updates
      
      toast({
        title: "🚀 Archivo Procesado",
        description: `${file.name} agregado a Memory con ${processData.contentLength} caracteres extraídos`
      })

      return processData

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

  return {
    isUploading,
    uploadFile
  }
}
