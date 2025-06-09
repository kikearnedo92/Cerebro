
import React, { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [project, setProject] = useState('')
  const [tags, setTags] = useState('')
  const { user } = useAuth()

  const uploadMutation = useMutation({
    mutationFn: async (formData: { files: File[], project: string, tags: string[] }) => {
      const uploadPromises = formData.files.map(async (file) => {
        // Upload file to storage
        const fileName = `${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('retorna-files')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('retorna-files')
          .getPublicUrl(fileName)

        // Extract text content (simplified - you might want to use a proper PDF/DOCX parser)
        const textContent = await extractTextFromFile(file)

        // Save to knowledge base
        const { error: dbError } = await supabase
          .from('knowledge_base')
          .insert({
            title: file.name,
            content: textContent,
            project: formData.project || 'General',
            tags: formData.tags,
            file_url: publicUrl,
            created_by: user?.id,
            active: true
          })

        if (dbError) throw dbError

        return { fileName, publicUrl }
      })

      return Promise.all(uploadPromises)
    },
    onSuccess: () => {
      toast({
        title: "Archivos subidos",
        description: "Los archivos han sido procesados y agregados a la knowledge base."
      })
      setFiles([])
      setProject('')
      setTags('')
      setUploadProgress(0)
      onUploadComplete?.()
    },
    onError: (error: any) => {
      toast({
        title: "Error al subir archivos",
        description: error.message,
        variant: "destructive"
      })
      setUploadProgress(0)
    }
  })

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simplified text extraction - you might want to use libraries like pdf-parse or mammoth
    if (file.type === 'text/plain') {
      return await file.text()
    } else if (file.type === 'application/pdf') {
      // For PDF files, you'd typically use a library like pdf-parse
      return `Contenido del archivo PDF: ${file.name}`
    } else if (file.type.includes('word')) {
      // For Word documents, you'd use mammoth or similar
      return `Contenido del archivo Word: ${file.name}`
    }
    return `Archivo: ${file.name} - Contenido no procesado automáticamente`
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No hay archivos",
        description: "Por favor selecciona al menos un archivo para subir.",
        variant: "destructive"
      })
      return
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    uploadMutation.mutate({ files, project, tags: tagsArray })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Soporta PDF, Word, TXT (máximo 10MB por archivo)
            </p>
            <Button variant="outline" asChild>
              <label>
                Seleccionar Archivos
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </Button>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
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

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo archivos...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleUpload}
            disabled={files.length === 0 || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUpload
