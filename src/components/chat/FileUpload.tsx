
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface FileUploadProps {
  onFileUpload: (fileContent: string, filename: string) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supportedTypes = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png']

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !supportedTypes.includes(fileExtension)) {
      toast({
        title: "Tipo de archivo no soportado",
        description: "Solo se permiten archivos PDF, DOCX, TXT, JPG y PNG",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Archivo muy grande",
        description: "El archivo no puede ser mayor a 10MB",
        variant: "destructive"
      })
      return
    }

    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`
      const { data, error } = await supabase.storage
        .from('retorna-files')
        .upload(`uploads/${fileName}`, selectedFile)

      if (error) throw error

      // Process file content based on type
      let fileContent = ''
      if (selectedFile.type.startsWith('text/') || selectedFile.name.endsWith('.txt')) {
        fileContent = await selectedFile.text()
      } else if (selectedFile.type.startsWith('image/')) {
        fileContent = `[Imagen adjuntada: ${selectedFile.name}]`
      } else {
        fileContent = `[Documento adjuntado: ${selectedFile.name}]`
      }

      // Save file record to database
      await supabase
        .from('uploaded_files')
        .insert({
          filename: selectedFile.name,
          file_url: data.path,
          file_type: selectedFile.type,
          processed_content: fileContent
        })

      onFileUpload(fileContent, selectedFile.name)
      setSelectedFile(null)

      toast({
        title: "Archivo subido",
        description: "El archivo se ha procesado correctamente"
      })
    } catch (error: any) {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
      />
      
      {selectedFile ? (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <FileText className="w-4 h-4" />
          <span className="text-sm truncate flex-1">{selectedFile.name}</span>
          <Button
            size="sm"
            onClick={uploadFile}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "Enviar"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedFile(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="p-2 h-auto"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export default FileUpload
