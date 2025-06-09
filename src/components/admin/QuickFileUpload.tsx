
import React, { useState, useCallback } from 'react'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, Plus, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const QuickFileUpload = () => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [project, setProject] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const { fetchItems } = useKnowledgeBase()
  const { user } = useAuth()

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

  const extractTextContent = async (file: File): Promise<string> => {
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

  const handleUpload = async () => {
    if (files.length === 0) return

    console.log('🔄 Starting enhanced file upload process...')
    setUploading(true)
    setUploadError(null)

    try {
      // 1. Verify auth
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error(`Auth error: ${authError.message}`)
      if (!currentUser) throw new Error('Usuario no autenticado')
      console.log('✅ User authenticated:', currentUser.email)

      // 2. Verify admin permissions
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role_system, full_name')
        .eq('id', currentUser.id)
        .single()

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)
      console.log('✅ User profile loaded:', profile)

      // 3. Test storage connection
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      if (bucketsError) throw new Error(`Storage error: ${bucketsError.message}`)
      console.log('✅ Storage accessible, buckets:', buckets.map(b => b.name))

      // 4. Process each file with detailed logging
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      for (const file of files) {
        console.log(`📄 Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} excede el límite de 10MB`)
        }

        // Upload to storage
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = `knowledge/${fileName}`

        console.log(`📤 Uploading to storage: ${filePath}`)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('retorna-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('❌ Storage upload failed:', uploadError)
          throw new Error(`Error subiendo ${file.name}: ${uploadError.message}`)
        }
        console.log('✅ File uploaded to storage:', uploadData.path)

        // Extract text content
        console.log(`📝 Extracting content from: ${file.name}`)
        const textContent = await extractTextContent(file)
        console.log(`📝 Content extracted: ${textContent.substring(0, 100)}...`)

        // Save to knowledge base
        console.log(`💾 Saving to knowledge base...`)
        const { data: kbData, error: kbError } = await supabase
          .from('knowledge_base')
          .insert({
            title: file.name.replace(/\.[^/.]+$/, ""),
            content: textContent,
            project: project || 'General',
            created_by: currentUser.id,
            file_url: uploadData.path,
            active: true,
            tags: tagsArray
          })
          .select('*')
          .single()

        if (kbError) {
          console.error('❌ Knowledge base insert failed:', kbError)
          // Cleanup uploaded file
          await supabase.storage.from('retorna-files').remove([filePath])
          throw new Error(`Error guardando ${file.name}: ${kbError.message}`)
        }

        console.log('✅ Knowledge base entry created:', kbData.id)
        toast({
          title: "Archivo procesado",
          description: `✅ ${file.name} agregado correctamente`,
        })
      }

      // Refresh knowledge base list
      console.log('🔄 Refreshing knowledge base list...')
      await fetchItems()

      // Reset form
      setFiles([])
      setProject('')
      setTags('')

      toast({
        title: "Upload completado",
        description: `Se procesaron ${files.length} archivo(s) correctamente`,
      })

    } catch (error) {
      console.error('💥 Upload process failed:', error)
      setUploadError(error.message)
      toast({
        title: "Error en upload",
        description: `❌ ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subida Rápida de Archivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Error Display */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </div>
        )}

        {/* Debug Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Debug: Usuario {user?.email} - Storage: retorna-files - Admin: {user?.email === 'eduardo@retorna.app' ? 'Sí' : 'No'}
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500 mb-3">
            PDF, Word, TXT, CSV, Excel (máximo 10MB)
          </p>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              Seleccionar Archivos
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="project" className="text-xs">Proyecto</Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="ATC, Research, Onboarding..."
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="tags" className="text-xs">Tags (separados por comas)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="política, procedimiento, FAQ..."
              className="h-8"
            />
          </div>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
          size="sm"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subiendo...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Subir {files.length} archivo(s)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default QuickFileUpload
