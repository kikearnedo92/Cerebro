import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface FileUploadProps {
  onUploadComplete?: (fileData: any) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  title?: string;
  project?: string;
  tags?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onError,
  maxFiles = 10,
  acceptedTypes = ['.pdf', '.docx', '.txt', '.md']
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const projects = [
    { id: 'atc', name: 'ATC - Atención al Cliente', icon: '📞' },
    { id: 'policies-chile', name: 'Políticas Chile', icon: '🇨🇱' },
    { id: 'policies-colombia', name: 'Políticas Colombia', icon: '🇨🇴' },
    { id: 'policies-spain', name: 'Políticas España', icon: '🇪🇸' },
    { id: 'compliance', name: 'Compliance', icon: '📋' },
    { id: 'procedures', name: 'Procedimientos', icon: '⚙️' },
    { id: 'scripts', name: 'Scripts', icon: '💬' },
    { id: 'research', name: 'Research', icon: '🔬' }
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Límite excedido",
        description: `Máximo ${maxFiles} archivos permitidos`,
        variant: "destructive"
      })
      return
    }

    const processedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'waiting',
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      project: '',
      tags: []
    }))

    setFiles(prev => [...prev, ...processedFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileMetadata = (id: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to uploading
      updateFileMetadata(uploadedFile.id, { status: 'uploading', progress: 10 })

      // Upload file to Supabase Storage
      const fileExt = uploadedFile.file.name.split('.').pop()
      const fileName = `${Date.now()}-${uploadedFile.file.name}`
      const filePath = `knowledge-base/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('retorna-files')
        .upload(filePath, uploadedFile.file)

      if (uploadError) throw uploadError

      updateFileMetadata(uploadedFile.id, { progress: 50 })

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('retorna-files')
        .getPublicUrl(filePath)

      updateFileMetadata(uploadedFile.id, { progress: 70, status: 'processing' })

      // Process document content (call edge function)
      const { data: processData, error: processError } = await supabase.functions
        .invoke('process-document', {
          body: {
            file_url: publicUrl,
            file_type: fileExt,
            filename: uploadedFile.file.name
          }
        })

      if (processError) throw processError

      updateFileMetadata(uploadedFile.id, { progress: 90 })

      // Save to knowledge base
      const { error: insertError } = await supabase
        .from('knowledge_base')
        .insert({
          title: uploadedFile.title || uploadedFile.file.name,
          content: processData.content || 'Contenido procesado automáticamente',
          project: uploadedFile.project || 'default',
          file_type: fileExt,
          file_url: publicUrl,
          tags: uploadedFile.tags || [],
          source: 'upload',
          active: true
        })

      if (insertError) throw insertError

      updateFileMetadata(uploadedFile.id, { 
        progress: 100, 
        status: 'completed' 
      })

      toast({
        title: "✅ Archivo subido",
        description: `${uploadedFile.file.name} se procesó correctamente`
      })

      onUploadComplete?.(processData)

    } catch (error) {
      console.error('Upload error:', error)
      updateFileMetadata(uploadedFile.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      })
      
      toast({
        title: "Error de subida",
        description: `No se pudo procesar ${uploadedFile.file.name}`,
        variant: "destructive"
      })

      onError?.(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleUploadAll = async () => {
    const filesToUpload = files.filter(f => f.status === 'waiting' && f.project && f.title)
    
    if (filesToUpload.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Complete los metadatos de los archivos antes de subir",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    // Upload files concurrently but with a limit
    const uploadPromises = filesToUpload.map(file => uploadFile(file))
    await Promise.allSettled(uploadPromises)

    setIsUploading(false)

    // Check if all uploads were successful
    const completedFiles = files.filter(f => f.status === 'completed')
    const errorFiles = files.filter(f => f.status === 'error')

    if (completedFiles.length > 0) {
      toast({
        title: `${completedFiles.length} archivos subidos`,
        description: "Los documentos están listos para usar en el chat"
      })
    }

    if (errorFiles.length > 0) {
      toast({
        title: `${errorFiles.length} archivos fallaron`,
        description: "Revisa los errores e intenta de nuevo",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'waiting': return 'Esperando...'
      case 'uploading': return 'Subiendo...'
      case 'processing': return 'Procesando...'
      case 'completed': return 'Completado'
      case 'error': return 'Error'
      default: return ''
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Subir Archivos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos a la Base de Conocimiento</DialogTitle>
          <DialogDescription>
            Arrastra archivos o haz clic para seleccionar. Los documentos se procesarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Formatos soportados: PDF, DOCX, TXT, MD
            </p>
            <p className="text-xs text-gray-400">
              Máximo {maxFiles} archivos, 50MB cada uno
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Archivos a procesar ({files.length})</h3>
                <Button 
                  onClick={handleUploadAll}
                  disabled={isUploading || files.every(f => f.status !== 'waiting')}
                >
                  {isUploading ? 'Procesando...' : 'Subir Todo'}
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {files.map((file) => (
                  <Card key={file.id} className="p-4">
                    <div className="space-y-3">
                      {/* File Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="font-medium text-sm">{file.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(file.status)}
                            </p>
                          </div>
                        </div>
                        {file.status === 'waiting' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <Progress value={file.progress} className="h-2" />
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {file.error}
                        </div>
                      )}

                      {/* Metadata Form */}
                      {file.status === 'waiting' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                          <div>
                            <Label className="text-xs">Título del documento</Label>
                            <Input
                              value={file.title}
                              onChange={(e) => updateFileMetadata(file.id, { title: e.target.value })}
                              placeholder="Título descriptivo"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Proyecto</Label>
                            <Select 
                              value={file.project} 
                              onValueChange={(value) => updateFileMetadata(file.id, { project: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Seleccionar proyecto" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map(project => (
                                  <SelectItem key={project.id} value={project.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{project.icon}</span>
                                      <span>{project.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Success State */}
                      {file.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                          <CheckCircle className="w-4 h-4" />
                          Documento procesado y agregado a la base de conocimiento
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FileUpload